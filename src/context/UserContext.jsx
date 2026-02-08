import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { isReservedUsername, normalizeUsernameInput } from '../constants/reservedUsernames';

const STORAGE_KEY_PROFILE = 'aist_profile';
const STORAGE_KEY_PHOTO = 'aist_profile_photo';

const defaultProfile = {
  displayName: '',
  username: '',
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

function loadPhoto() {
  try {
    return localStorage.getItem(STORAGE_KEY_PHOTO) || '';
  } catch {
    return '';
  }
}

function saveProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch {}
}

function savePhoto(dataUrl) {
  try {
    if (dataUrl) localStorage.setItem(STORAGE_KEY_PHOTO, dataUrl);
    else localStorage.removeItem(STORAGE_KEY_PHOTO);
  } catch {}
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [profile, setProfileState] = useState(loadProfile);
  const [profilePhoto, setProfilePhotoState] = useState(loadPhoto);

  useEffect(() => {
    saveProfile(profile);
  }, [profile]);
  useEffect(() => {
    savePhoto(profilePhoto);
  }, [profilePhoto]);

  const setProfile = (next) => {
    setProfileState((prev) => (typeof next === 'function' ? next(prev) : { ...prev, ...next }));
  };
  const setProfilePhoto = (dataUrl) => {
    setProfilePhotoState(dataUrl || '');
    savePhoto(dataUrl || '');
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
      setProfilePhoto,
      usernameError,
      displayName: profile.displayName,
      username: profile.username,
      usernameFormatted: profile.username ? `@${profile.username}` : '',
      profilePhoto,
    }),
    [profile, profilePhoto, usernameError]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
