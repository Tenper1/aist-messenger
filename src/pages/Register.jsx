import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * AIST PWA Messenger — Register/Login via phone number
 * Auth flow: user enters phone → code sent via Telegram bot → verify code.
 * Backend endpoints:
 * POST /api/auth/request-code { phone: "+79255445330" }
 *   -> { ok: true, masked?: string, ttlSeconds?: number }
 * POST /api/auth/verify-code { phone, code }
 *   -> { ok: true, token, user? }
 */

function normalizePhone(input) {
  const raw = String(input ?? "").trim();
  if (!raw) return "";
  // Убираем всё, кроме цифр
  const digits = raw.replace(/\D/g, "");
  // Приводим к формату +7XXXXXXXXXX
  if (digits.startsWith("8")) {
    return "+7" + digits.slice(1);
  } else if (digits.startsWith("7")) {
    return "+7" + digits.slice(1);
  } else if (digits.length === 10) {
    return "+7" + digits;
  }
  return "+" + digits;
}

function isValidRussianPhone(value) {
  return /^\+7\d{10}$/.test(value);
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
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [maskedDestination, setMaskedDestination] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState(null);
  const [remaining, setRemaining] = useState(null);
  const [cooldown, setCooldown] = useState(0);
  const abortRef = useRef(null);
  const codeInputRef = useRef(null);

  const canRequest = useMemo(() => {
    if (busy) return false;
    if (cooldown > 0) return false;
    return isValidRussianPhone(normalizePhone(phoneInput));
  }, [busy, cooldown, phoneInput]);

  const canVerify = useMemo(() => {
    if (busy) return false;
    const d = digitsOnly(code);
    return d.length >= 4 && d.length <= 8;
  }, [busy, code]);

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
    if (!isValidRussianPhone(normalized)) {
      setMessage("Введите корректный номер телефона (+79255445330).");
      return;
    }
    setBusy(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await postJson(
        "/api/auth/request-code",
        { phone: normalized },
        { signal: controller.signal }
      );

      if (data?.ok === false) {
        setMessage(data?.message || "Не удалось отправить код. Попробуйте ещё раз.");
        return;
      }

      setPhone(normalized);
      setMaskedDestination(data?.masked || "");
      setTtlSeconds(typeof data?.ttlSeconds === "number" ? data.ttlSeconds : null);
      setRemaining(typeof data?.ttlSeconds === "number" ? data.ttlSeconds : null);
      setCooldown(15);
      setCode("");
      setStep("verify");
      setMessage(
        data?.masked
          ? `Код отправлен в Telegram (${data.masked}).`
          : "Код отправлен в Telegram-бот. Введите его здесь."
      );
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
    setBusy(true);
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await postJson(
        "/api/auth/verify-code",
        { phone: normalizedPhone, code: d },
        { signal: controller.signal }
      );

      if (data?.ok === false) {
        if (typeof data?.retryAfterSeconds === "number") {
          setCooldown(Math.max(0, Math.floor(data.retryAfterSeconds)));
        }
        setMessage(data?.message || "Неверный код или он истёк. Попробуйте ещё раз.");
        return;
      }

      const token = data?.token;
      if (token) {
        localStorage.setItem("aist_token", token);
      }

      window.location.assign("/");
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

  const glassStyle = useMemo(() => ({
    page: {
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "24px",
      color: "rgba(255,255,255,.92)",
      background:
        "radial-gradient(1200px 800px at 20% 10%, rgba(120, 205, 255, .35), transparent 55%), " +
        "radial-gradient(900px 700px at 85% 20%, rgba(200, 120, 255, .30), transparent 55%), " +
        "radial-gradient(900px 700px at 30% 90%, rgba(90, 255, 200, .22), transparent 55%), " +
        "linear-gradient(135deg, #070A12 0%, #090B18 40%, #09091A 100%)",
    },
    card: {
      width: "min(460px, 92vw)",
      borderRadius: "22px",
      padding: "22px",
      background: "rgba(255,255,255,.08)",
      border: "1px solid rgba(255,255,255,.16)",
      boxShadow:
        "0 18px 60px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.12)",
      backdropFilter: "blur(16px) saturate(140%)",
      WebkitBackdropFilter: "blur(16px) saturate(140%)",
      position: "relative",
      overflow: "hidden",
    },
    shine: {
      position: "absolute",
      inset: "-2px",
      background:
        "radial-gradient(500px 240px at 20% 10%, rgba(255,255,255,.20), transparent 60%), " +
        "radial-gradient(420px 220px at 90% 0%, rgba(255,255,255,.14), transparent 55%)",
      pointerEvents: "none",
      mixBlendMode: "screen",
    },
    header: { display: "flex", gap: "12px", alignItems: "center" },
    logo: {
      width: 44,
      height: 44,
      borderRadius: 14,
      background:
        "linear-gradient(135deg, rgba(140,200,255,.55), rgba(210,150,255,.35))",
      border: "1px solid rgba(255,255,255,.22)",
      boxShadow: "0 10px 30px rgba(0,0,0,.35)",
      display: "grid",
      placeItems: "center",
      fontWeight: 800,
      letterSpacing: ".5px",
      color: "rgba(10, 15, 30, .85)",
      userSelect: "none",
    },
    titleWrap: { display: "flex", flexDirection: "column" },
    title: { margin: 0, fontSize: 18, fontWeight: 760, lineHeight: 1.15 },
    subtitle: {
      margin: "6px 0 0",
      fontSize: 13,
      color: "rgba(255,255,255,.72)",
      lineHeight: 1.25,
    },
    divider: {
      height: 1,
      background: "linear-gradient(90deg, transparent, rgba(255,255,255,.18), transparent)",
      margin: "16px 0",
    },
    field: { display: "grid", gap: 8, marginTop: 12 },
    label: {
      fontSize: 12,
      color: "rgba(255,255,255,.70)",
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
    },
    helper: { fontSize: 12, color: "rgba(255,255,255,.55)" },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: 14,
      outline: "none",
      color: "rgba(255,255,255,.92)",
      background: "rgba(10, 14, 28, .40)",
      border: "1px solid rgba(255,255,255,.14)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
      fontSize: 14,
    },
    inputRow: { display: "grid", gridTemplateColumns: "1fr", gap: 10 },
    buttonsRow: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
    primaryBtn: {
      flex: "1 1 160px",
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.18)",
      color: "rgba(10, 15, 30, .92)",
      background:
        "linear-gradient(135deg, rgba(180, 225, 255, .98), rgba(220, 170, 255, .92))",
      boxShadow: "0 14px 40px rgba(0,0,0,.45)",
      fontWeight: 750,
      cursor: "pointer",
    },
    secondaryBtn: {
      flex: "1 1 160px",
      padding: "12px 14px",
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,.16)",
      color: "rgba(255,255,255,.86)",
      background: "rgba(255,255,255,.08)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,.06)",
      cursor: "pointer",
    },
    disabled: { opacity: 0.55, cursor: "not-allowed" },
    hintBox: {
      marginTop: 12,
      padding: "10px 12px",
      borderRadius: 14,
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.12)",
      color: "rgba(255,255,255,.78)",
      fontSize: 13,
      lineHeight: 1.35,
    },
    footer: {
      marginTop: 14,
      display: "flex",
      justifyContent: "space-between",
      gap: 12,
      color: "rgba(255,255,255,.58)",
      fontSize: 12,
      flexWrap: "wrap",
    },
    pill: {
      padding: "6px 10px",
      borderRadius: 999,
      border: "1px solid rgba(255,255,255,.14)",
      background: "rgba(255,255,255,.06)",
    },
  }), []);

  return (
    <div style={glassStyle.page}>
      <div style={glassStyle.card} role="region" aria-label="AIST вход">
        <div style={glassStyle.shine} />
        <div style={glassStyle.header}>
          <div style={glassStyle.logo} aria-hidden="true">
            AI
          </div>
          <div style={glassStyle.titleWrap}>
            <h1 style={glassStyle.title}>AIST</h1>
            <p style={glassStyle.subtitle}>
              Вход по коду из Telegram-бота (Liquid Glass UI)
            </p>
          </div>
        </div>

        <div style={glassStyle.divider} />

        {step === "request" && (
          <>
            <div style={glassStyle.field}>
              <div style={glassStyle.label}>
                <span>Номер телефона</span>
                <span style={glassStyle.helper}>например, +79255445330</span>
              </div>
              <div style={glassStyle.inputRow}>
                <input
                  style={glassStyle.input}
                  inputMode="tel"
                  placeholder="+79255445330"
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
              Откройте Telegram и найдите бота AIST. Код придёт туда. Если бот ещё не
              активирован — нажмите <b>/start</b> и отправьте свой номер.
            </div>
          </>
        )}

        {step === "verify" && (
          <>
            <div style={glassStyle.field}>
              <div style={glassStyle.label}>
                <span>Код из Telegram</span>
                <span style={glassStyle.helper}>для {phone}</span>
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
                  : "Доставка: Telegram-бот"}
              </span>
              <span style={glassStyle.pill}>
                {remaining == null
                  ? ttlSeconds
                    ? `Срок: ~${ttlSeconds}с`
                    : "Срок: зависит от сервера"
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
      </div>
    </div>
  );
}