import { createContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import {
  LocalAuthUser,
  createLocalAccount,
  createLocalUserProfile,
  getProfileById,
  getSessionUserId,
  setSessionUserId,
  signInLocalAccount,
  upsertProfile,
} from '../lib/localStore';

interface AuthContextType {
  user: LocalAuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<LocalAuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionUserId = getSessionUserId();
    if (!sessionUserId) {
      setLoading(false);
      return;
    }

    const existingProfile = getProfileById(sessionUserId);
    if (!existingProfile) {
      setSessionUserId(null);
      setLoading(false);
      return;
    }

    setUser({ id: existingProfile.id, email: `${existingProfile.id}@local.user` });
    setProfile(existingProfile);
    setLoading(false);
  }, []);

  const fetchProfile = async (userId: string) => {
    const existingProfile = getProfileById(userId);
    setProfile(existingProfile);
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const createdUser = createLocalAccount(email, password);
    const createdProfile = createLocalUserProfile(createdUser, fullName);
    upsertProfile(createdProfile);
    setSessionUserId(createdUser.id);
    setUser(createdUser);
    setProfile(createdProfile);
  };

  const signIn = async (email: string, password: string) => {
    const signedInUser = signInLocalAccount(email, password);
    const signedInProfile = getProfileById(signedInUser.id);

    if (!signedInProfile) {
      throw new Error('Kullanici profili bulunamadi.');
    }

    setSessionUserId(signedInUser.id);
    setUser(signedInUser);
    setProfile(signedInProfile);
  };

  const signOut = async () => {
    setSessionUserId(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const existingProfile = getProfileById(user.id);
    if (!existingProfile) {
      throw new Error('Guncellenecek profil bulunamadi.');
    }

    upsertProfile({
      ...existingProfile,
      ...data,
      updated_at: new Date().toISOString(),
    });
    await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
