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

// Derive encryption key from a base key (in production, use user's password)
const getEncryptionKey = () => {
  return 'taxsimple_2024_secure_key';
};

const encrypt = (data: string): string => {
  return CryptoJS.AES.encrypt(data, getEncryptionKey()).toString();
};

const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, getEncryptionKey());
  return bytes.toString(CryptoJS.enc.Utf8);
};

const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
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
    } catch (error) {
      console.error('Failed to load auth state:', error);
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

      const users = getUsers();
      const userRecord = users[email.toLowerCase()];

      if (!userRecord) {
        return { success: false, error: 'No account found with this email' };
      }

      const passwordHash = hashPassword(password);
      if (userRecord.passwordHash !== passwordHash) {
        return { success: false, error: 'Incorrect password' };
      }

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
