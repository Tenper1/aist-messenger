import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { isReservedUsername, normalizeUsernameInput } from '../constants/reservedUsernames';

const STORAGE_KEY_PROFILE = 'aist_profile';

const defaultProfile = {
  displayName: '',
  username: '', // без @, например admin
};

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return { ...defaultProfile };
    const parsed = JSON.parse(raw);
    return {
      displayName: parsed.displayName ?? defaultProfile.displayName,
      username: parsed.username ?? defaultProfile.username,
    };
  } catch {
    return { ...defaultProfile };
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {}
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfileState] = useState(loadProfile);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  const setProfile = (next) => {
    setProfileState((prev) => (typeof next === 'function' ? next(prev) : { ...prev, ...next }));
  };

  const setDisplayName = (name) => setProfile({ displayName: String(name ?? '').trim().slice(0, 64) });
  const setUsername = (value) => {
    const normalized = normalizeUsernameInput(value);
    setProfile({ username: normalized });
  };

  const usernameError = useMemo(() => {
    const u = profile.username;
    if (!u) return null;
    if (u.length < 2) return 'Никнейм не менее 2 символов';
    if (isReservedUsername(u)) return 'Это имя зарезервировано';
    return null;
  }, [profile.username]);

  const value = useMemo(
    () => ({
      profile,
      setProfile,
      setDisplayName,
      setUsername,
      usernameError,
      displayName: profile.displayName,
      username: profile.username,
      usernameFormatted: profile.username ? `@${profile.username}` : '',
    }),
    [profile, usernameError]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
