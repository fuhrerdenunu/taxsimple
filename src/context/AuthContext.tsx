import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import CryptoJS from 'crypto-js';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'taxsimple_auth';
const USERS_KEY = 'taxsimple_users';
const RATE_LIMIT_KEY = 'taxsimple_rate_limit';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Encryption key from environment or fallback for development
const getEncryptionKey = () => {
  return process.env.REACT_APP_ENCRYPTION_KEY || 'dev_only_not_for_production';
};

const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
};

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Hash password using PBKDF2 with salt for better security
const hashPassword = (password: string, salt?: string): string => {
  const useSalt = salt || CryptoJS.lib.WordArray.random(128 / 8).toString();
  const hash = CryptoJS.PBKDF2(password, useSalt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  return `${useSalt}:${hash}`;
};

const verifyPassword = (password: string, storedHash: string): boolean => {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const testHash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 10000
  }).toString();
  return hash === testHash;
};

interface RateLimitData {
  attempts: number;
  lockoutUntil: number | null;
}

const getRateLimitData = (email: string): RateLimitData => {
  try {
    const stored = localStorage.getItem(`${RATE_LIMIT_KEY}_${email.toLowerCase()}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }
  return { attempts: 0, lockoutUntil: null };
};

const setRateLimitData = (email: string, data: RateLimitData) => {
  localStorage.setItem(`${RATE_LIMIT_KEY}_${email.toLowerCase()}`, JSON.stringify(data));
};

const clearRateLimitData = (email: string) => {
  localStorage.removeItem(`${RATE_LIMIT_KEY}_${email.toLowerCase()}`);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const decrypted = decrypt(stored);
        const userData = JSON.parse(decrypted);
        setUser(userData);
      }
    } catch {
      // Auth state corrupted or key changed - clear and start fresh
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      const encrypted = encrypt(JSON.stringify(user));
      localStorage.setItem(STORAGE_KEY, encrypted);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const getUsers = (): Record<string, { passwordHash: string; user: User }> => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        return JSON.parse(decrypt(stored));
      }
    } catch {
      // Ignore errors
    }
    return {};
  };

  const saveUsers = (users: Record<string, { passwordHash: string; user: User }>) => {
    localStorage.setItem(USERS_KEY, encrypt(JSON.stringify(users)));
  };

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check rate limiting
      const rateLimitData = getRateLimitData(email);

      if (rateLimitData.lockoutUntil && Date.now() < rateLimitData.lockoutUntil) {
        const remainingMinutes = Math.ceil((rateLimitData.lockoutUntil - Date.now()) / 60000);
        return {
          success: false,
          error: `Too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`
        };
      }

      const users = getUsers();
      const userRecord = users[email.toLowerCase()];

      if (!userRecord) {
        // Increment failed attempts even for non-existent accounts (prevent enumeration)
        const newAttempts = rateLimitData.attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          setRateLimitData(email, { attempts: newAttempts, lockoutUntil: Date.now() + LOCKOUT_DURATION });
        } else {
          setRateLimitData(email, { attempts: newAttempts, lockoutUntil: null });
        }
        return { success: false, error: 'Invalid email or password' };
      }

      if (!verifyPassword(password, userRecord.passwordHash)) {
        // Increment failed attempts
        const newAttempts = rateLimitData.attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          setRateLimitData(email, { attempts: newAttempts, lockoutUntil: Date.now() + LOCKOUT_DURATION });
          return {
            success: false,
            error: 'Too many failed attempts. Your account has been locked for 15 minutes.'
          };
        } else {
          setRateLimitData(email, { attempts: newAttempts, lockoutUntil: null });
          const remaining = MAX_ATTEMPTS - newAttempts;
          return {
            success: false,
            error: `Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
          };
        }
      }

      // Successful login - clear rate limit data
      clearRateLimitData(email);
      setUser(userRecord.user);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Validate password strength
      if (password.length < 8) {
        return { success: false, error: 'Password must be at least 8 characters' };
      }
      if (!/[A-Z]/.test(password)) {
        return { success: false, error: 'Password must contain an uppercase letter' };
      }
      if (!/[0-9]/.test(password)) {
        return { success: false, error: 'Password must contain a number' };
      }

      const users = getUsers();
      const emailLower = email.toLowerCase();

      if (users[emailLower]) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email: emailLower,
        name,
        createdAt: new Date().toISOString()
      };

      users[emailLower] = {
        passwordHash: hashPassword(password),
        user: newUser
      };

      saveUsers(users);
      setUser(newUser);
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);

      // Also update in users storage
      const users = getUsers();
      if (users[user.email]) {
        users[user.email].user = updatedUser;
        saveUsers(users);
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
