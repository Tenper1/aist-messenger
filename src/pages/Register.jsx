import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useTheme } from "../context/ThemeContext";

/**
 * AIST PWA Messenger — Register/Login screen
 * Вход по коду из Telegram или (в будущем) по СМС. При входе по коду из ТГ — пользовательское соглашение (законы РФ).
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api.get-aist.ru";

const USER_AGREEMENT_URL = "/user-agreement";

function normalizePhone(input) {
  if (!input) return "";
  const digitsOnly = String(input).replace(/\D/g, "");
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith("7")) {
    return "+" + digitsOnly;
  } else if (digitsOnly.length === 10) {
    return "+7" + digitsOnly;
  } else if (digitsOnly.length === 11 && digitsOnly.startsWith("8")) {
    return "+7" + digitsOnly.substring(1);
  }
  return "";
}

function isValidPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return false;
  return /^\+7\d{10}$/.test(normalized);
}

function formatPhone(value) {
  const normalized = normalizePhone(value);
  if (!normalized) return value;
  return normalized.replace(/^(\+7)(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 ($2) $3-$4-$5");
}

function digitsOnly(value) {
  return String(value ?? "").replace(/\D+/g, "");
}

async function postJson(url, body, { signal } = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message =
      (json && (json.message || json.error)) ||
      `HTTP ${res.status} ${res.statusText}`.trim();
    const err = new Error(message);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json ?? {};
}

export default function Register() {
  const { theme, isDark } = useTheme();
  const [authMethod, setAuthMethod] = useState("telegram"); // 'telegram' | 'sms' (sms пока заглушка)
  const [step, setStep] = useState("request");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const [debugCode, setDebugCode] = useState(""); // если бэкенд вернул debugCode — показываем для теста

  const abortRef = useRef(null);
  const codeInputRef = useRef(null);

  const canRequest = useMemo(() => {
    if (busy) return false;
    if (cooldown > 0) return false;
    return isValidPhone(phoneInput);
  }, [busy, cooldown, phoneInput]);

  const canVerify = useMemo(() => {
    if (busy) return false;
    if (!agreementAccepted) return false;
    const d = digitsOnly(code);
    return d.length >= 4 && d.length <= 8;
  }, [busy, agreementAccepted, code]);

  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  useEffect(() => {
    if (remaining == null) return;
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => (r == null ? r : r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => (c <= 0 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    if (step !== "verify") return;
    const t = setTimeout(() => codeInputRef.current?.focus?.(), 50);
    return () => clearTimeout(t);
  }, [step]);

  async function requestCode() {
    setMessage("");
    const normalized = normalizePhone(phoneInput);
    if (!isValidPhone(normalized)) {
      setMessage("Введите корректный номер телефона (например, +7 999 123-45-67 или 8 999 123-45-67).");
      return;
    }

    setBusy(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await postJson(
        `${API_BASE_URL}/api/auth/request-code`,
        { phone: normalized },
        { signal: controller.signal }
      );

      if (data?.ok === false) {
        const errorMsg = data?.message || "Не удалось отправить код. Попробуйте ещё раз.";
        setMessage(errorMsg);
        if (errorMsg.includes("не найден") || errorMsg.includes("активируйте")) {
          setMessage(errorMsg + " После активации попробуйте снова.");
        }
        return;
      }

      setPhone(normalized);
      setMaskedDestination(data?.masked || "");
      setTtlSeconds(typeof data?.ttlSeconds === "number" ? data.ttlSeconds : 300);
      setRemaining(typeof data?.ttlSeconds === "number" ? data.ttlSeconds : 300);
      setCooldown(15);
      const devCode = data?.debugCode != null ? String(data.debugCode) : "";
      setDebugCode(devCode);
      setCode(devCode);
      setAgreementAccepted(false);
      setStep("verify");
      if (devCode) {
        setMessage("Код для входа (режим разработки): введите его ниже или скопируйте.");
      } else {
        setMessage(
          data?.masked
            ? `Код отправлен в Telegram на номер ${data.masked}.`
            : "Код отправлен в Telegram-бот @AIST_SMS_BOT. Введите его здесь."
        );
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      setMessage(err?.message || "Ошибка сети при отправке кода.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setMessage("");
    const normalizedPhone = normalizePhone(phone);
    const d = digitsOnly(code);
    if (!normalizedPhone) {
      setStep("request");
      setMessage("Сначала укажите номер телефона и запросите код.");
      return;
    }
    if (d.length < 4 || d.length > 8) {
      setMessage("Введите код из 4–8 цифр.");
      return;
    }
    if (!agreementAccepted) {
      setMessage("Необходимо принять пользовательское соглашение.");
      return;
    }

    setBusy(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await postJson(
        `${API_BASE_URL}/api/auth/verify-code`,
        { phone: normalizedPhone, code: d },
        { signal: controller.signal }
      );

      if (data?.ok === false) {
        const errorMsg = data?.message || "Неверный код или он истёк. Попробуйте ещё раз.";
        if (typeof data?.retryAfterSeconds === "number") {
          const retrySec = Math.max(0, Math.floor(data.retryAfterSeconds));
          setCooldown(retrySec);
          setMessage(`${errorMsg} Повторить можно через ${retrySec} секунд.`);
        } else {
          setMessage(errorMsg);
        }
        return;
      }

      const token = data?.token;
      if (token) {
        localStorage.setItem("aist_token", token);
      }

      window.location.assign("/messenger");
    } catch (err) {
      if (err?.name === "AbortError") return;
      setMessage(err?.message || "Ошибка сети при проверке кода.");
    } finally {
      setBusy(false);
    }
  }

  function onCodeChange(e) {
    const next = digitsOnly(e.target.value).slice(0, 8);
    setCode(next);
  }

  const glassStyle = useMemo(
    () => ({
      page: {
        minHeight: "100vh",
        width: "100vw",
        display: "grid",
        placeItems: "center",
        padding: "20px 0",
        margin: 0,
        color: theme.text,
        background: theme.pageBg,
        backgroundAttachment: "fixed",
        overflow: "auto",
      },
      card: {
        width: "min(460px, 92vw)",
        borderRadius: 22,
        padding: 22,
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        boxShadow: isDark
          ? "0 18px 60px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.08)"
          : "0 20px 60px rgba(80,120,180,.18), inset 0 1px 0 rgba(255,255,255,.7)",
        backdropFilter: "blur(16px) saturate(140%)",
        WebkitBackdropFilter: "blur(16px) saturate(140%)",
        position: "relative",
        overflow: "hidden",
      },
      shine: {
        position: "absolute",
        inset: "-2px",
        background: isDark
          ? "radial-gradient(500px 240px at 20% 10%, rgba(255,255,255,.12), transparent 60%)"
          : "radial-gradient(400px 200px at 80% 0%, rgba(255,255,255,.4), transparent 55%)",
        pointerEvents: "none",
        mixBlendMode: "overlay",
      },
      header: { display: "flex", gap: 12, alignItems: "center" },
      logo: {
        width: 44,
        height: 44,
        borderRadius: 14,
        background: theme.accent,
        border: "1px solid rgba(255,255,255,.35)",
        boxShadow: "0 8px 24px rgba(0,0,0,.2)",
        display: "grid",
        placeItems: "center",
        fontWeight: 800,
        fontSize: 16,
        color: theme.accentText,
        userSelect: "none",
      },
      titleWrap: { display: "flex", flexDirection: "column" },
      title: { margin: 0, fontSize: 18, fontWeight: 700, lineHeight: 1.15, color: theme.text },
      subtitle: { margin: "6px 0 0", fontSize: 13, color: theme.textMuted, lineHeight: 1.25 },
      tabs: {
        display: "flex",
        gap: 8,
        marginBottom: 16,
        borderBottom: `1px solid ${theme.border}`,
        paddingBottom: 12,
      },
      tab: {
        padding: "8px 14px",
        borderRadius: 12,
        border: "none",
        background: "transparent",
        color: theme.textMuted,
        fontSize: 14,
        cursor: "pointer",
      },
      tabActive: { color: theme.text, background: theme.sidebarBg || theme.cardBg, fontWeight: 600 },
      tabDisabled: { opacity: 0.5, cursor: "not-allowed" },
      divider: {
        height: 1,
        background: `linear-gradient(90deg, transparent, ${theme.border}, transparent)`,
        margin: "16px 0",
      },
      field: { display: "grid", gap: 8, marginTop: 12 },
      label: { fontSize: 12, color: theme.textMuted, display: "flex", justifyContent: "space-between", gap: 12 },
      helper: { fontSize: 12, color: theme.textMuted, opacity: 0.9 },
      input: {
        width: "100%",
        padding: "12px 14px",
        borderRadius: 14,
        outline: "none",
        color: theme.text,
        background: theme.inputBg,
        border: `1px solid ${theme.inputBorder}`,
        fontSize: 14,
      },
      inputRow: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
      buttonsRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
      primaryBtn: {
        flex: "1 1 160px",
        padding: "12px 14px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,.25)",
        color: theme.accentText,
        background: theme.accent,
        boxShadow: "0 10px 30px rgba(0,0,0,.2)",
        fontWeight: 600,
        cursor: "pointer",
      },
      secondaryBtn: {
        flex: "1 1 160px",
        padding: "12px 14px",
        borderRadius: 14,
        border: `1px solid ${theme.border}`,
        color: theme.text,
        background: theme.sidebarBg || "rgba(255,255,255,.08)",
        cursor: "pointer",
        fontSize: 14,
      },
      disabled: { opacity: 0.55, cursor: "not-allowed" },
      hintBox: {
        marginTop: 12,
        padding: "10px 12px",
        borderRadius: 14,
        background: theme.sidebarBg || "rgba(255,255,255,.06)",
        border: `1px solid ${theme.border}`,
        color: theme.textMuted,
        fontSize: 13,
        lineHeight: 1.35,
      },
      agreementRow: {
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        marginTop: 12,
        marginBottom: 8,
      },
      agreementLabel: { fontSize: 13, color: theme.textMuted, lineHeight: 1.4, cursor: "pointer" },
      agreementLink: { color: theme.text, textDecoration: "underline", marginLeft: 2 },
      footer: {
        marginTop: 14,
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        color: theme.textMuted,
        fontSize: 12,
        flexWrap: "wrap",
      },
      pill: {
        padding: "6px 10px",
        borderRadius: 999,
        border: `1px solid ${theme.border}`,
        background: theme.sidebarBg || "rgba(255,255,255,.06)",
      },
      backLink: { color: theme.textMuted, fontSize: 14, marginTop: 16, display: "block" },
    }),
    [theme, isDark]
  );

  return (
    <div style={glassStyle.page}>
      <div style={{ ...glassStyle.card, margin: "20px" }} role="region" aria-label="AIST вход">
        <div style={glassStyle.shine} />

        <div style={glassStyle.header}>
          <div style={glassStyle.logo} aria-hidden="true">
            AI
          </div>
          <div style={glassStyle.titleWrap}>
            <h1 style={glassStyle.title}>AIST</h1>
            <p style={glassStyle.subtitle}>
              Вход по коду из Telegram-бота @AIST_SMS_BOT
            </p>
          </div>
        </div>

        <div style={glassStyle.tabs}>
          <button
            type="button"
            style={{
              ...glassStyle.tab,
              ...(authMethod === "telegram" ? glassStyle.tabActive : {}),
            }}
            onClick={() => setAuthMethod("telegram")}
          >
            По коду из Telegram
          </button>
          <button
            type="button"
            style={{
              ...glassStyle.tab,
              ...(authMethod === "qr" ? glassStyle.tabActive : {}),
            }}
            onClick={() => setAuthMethod("qr")}
          >
            По QR
          </button>
          <button
            type="button"
            style={{ ...glassStyle.tab, ...glassStyle.tabDisabled }}
            disabled
            title="Скоро"
          >
            По СМС (скоро)
          </button>
        </div>
        <div style={glassStyle.divider} />

        {authMethod === "qr" && (
          <div style={glassStyle.field}>
            <p style={{ ...glassStyle.helper, marginBottom: 12 }}>
              Вход на другом устройстве по QR. На уже авторизованном устройстве откройте Настройки → «Войти на другом устройстве по QR» и отсканируйте этот код камерой нового устройства.
            </p>
            <div style={{ padding: 16, background: theme.inputBg, borderRadius: 14, display: 'inline-block' }}>
              <QRCodeSVG
                value={typeof window !== "undefined" ? window.location.origin + "/login" : "https://get-aist.ru/login"}
                size={200}
                level="M"
              />
            </div>
          </div>
        )}

        {authMethod !== "qr" && step === "request" && (
          <>
            <div style={glassStyle.field}>
              <div style={glassStyle.label}>
                <span>Номер телефона</span>
                <span style={glassStyle.helper}>например, +7 999 123-45-67</span>
              </div>
              <div style={glassStyle.inputRow}>
                <input
                  style={glassStyle.input}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7 999 123-45-67"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") requestCode();
                  }}
                  aria-label="Номер телефона"
                />
              </div>
            </div>

            <div style={glassStyle.buttonsRow}>
              <button
                type="button"
                onClick={requestCode}
                disabled={!canRequest}
                style={{
                  ...glassStyle.primaryBtn,
                  ...(!canRequest ? glassStyle.disabled : null),
                }}
              >
                {busy ? "Отправляем…" : cooldown > 0 ? `Подождите ${cooldown}с` : "Получить код"}
              </button>
            </div>

            <div style={glassStyle.hintBox}>
              <b>Важно:</b> Сначала активируйте бота <b>@AIST_SMS_BOT</b> в Telegram:
              <br />1. Найдите бота <b>@AIST_SMS_BOT</b>
              <br />2. Нажмите <b>/start</b>
              <br />3. Отправьте номер телефона через кнопку
              <br />4. После этого введите номер здесь и запросите код
            </div>
          </>
        )}

        {authMethod !== "qr" && step === "verify" && (
          <>
            {debugCode && (
              <div style={{ ...glassStyle.field, padding: "12px 16px", borderRadius: 12, background: "rgba(0,136,204,0.12)", marginBottom: 8 }}>
                <div style={{ fontSize: 14, color: theme.textMuted, marginBottom: 4 }}>Код для входа (только для теста)</div>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 4 }}>{debugCode}</div>
              </div>
            )}
            <div style={glassStyle.field}>
              <div style={glassStyle.label}>
                <span>Код из Telegram</span>
                <span style={glassStyle.helper}>для {formatPhone(phone)}</span>
              </div>
              <div style={glassStyle.agreementRow}>
                <input
                  type="checkbox"
                  id="agreement"
                  checked={agreementAccepted}
                  onChange={(e) => setAgreementAccepted(e.target.checked)}
                  style={{ marginTop: 4, cursor: "pointer" }}
                  aria-describedby="agreement-text"
                />
                <label id="agreement-text" htmlFor="agreement" style={glassStyle.agreementLabel}>
                  Я принимаю{" "}
                  <a href={USER_AGREEMENT_URL} target="_blank" rel="noopener noreferrer" style={glassStyle.agreementLink}>
                    пользовательское соглашение
                  </a>{" "}
                  и условия обработки персональных данных (в соответствии с законодательством РФ).
                </label>
              </div>
              <input
                ref={codeInputRef}
                style={glassStyle.input}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Введите код"
                value={code}
                onChange={onCodeChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") verifyCode();
                }}
                aria-label="Код подтверждения"
              />
            </div>

            <div style={glassStyle.buttonsRow}>
              <button
                type="button"
                onClick={verifyCode}
                disabled={!canVerify}
                style={{
                  ...glassStyle.primaryBtn,
                  ...(!canVerify ? glassStyle.disabled : null),
                }}
              >
                {busy ? "Проверяем…" : "Войти"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("request");
                  setPhoneInput(phone);
                  setMessage("");
                }}
                disabled={busy}
                style={{
                  ...glassStyle.secondaryBtn,
                  ...(busy ? glassStyle.disabled : null),
                }}
              >
                Изменить номер
              </button>

              <button
                type="button"
                onClick={requestCode}
                disabled={busy || cooldown > 0}
                style={{
                  ...glassStyle.secondaryBtn,
                  ...(busy || cooldown > 0 ? glassStyle.disabled : null),
                }}
                title={cooldown > 0 ? `Повторить можно через ${cooldown}с` : "Отправить новый код"}
              >
                {cooldown > 0 ? `Повторить через ${cooldown}с` : "Отправить ещё раз"}
              </button>
            </div>

            <div style={glassStyle.footer}>
              <span style={glassStyle.pill}>
                {maskedDestination
                  ? `Доставка: ${maskedDestination}`
                  : "Доставка: @AIST_SMS_BOT"}
              </span>
              <span style={glassStyle.pill}>
                {remaining == null
                  ? ttlSeconds
                    ? `Срок: ~${ttlSeconds}с`
                    : "Срок: 5 минут"
                  : remaining > 0
                    ? `Истекает через: ${remaining}с`
                    : "Код истёк — запросите новый"}
              </span>
            </div>
          </>
        )}

        {message ? (
          <div style={glassStyle.hintBox} role="status" aria-live="polite">
            {message}
          </div>
        ) : null}
        <Link to="/" style={glassStyle.backLink}>
          ← На главную
        </Link>
      </div>
    </div>
  );
}
