import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SubscriptionPlan, OrganizationConfig, BusinessRegion } from '../types';
import { STORAGE_KEY_USER } from '../constants';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isEarlyAccess: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (bizName: string, email: string, phoneNumber: string, plan: SubscriptionPlan, region: BusinessRegion) => Promise<void>;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateConfig: (config: OrganizationConfig) => void;
  completeOnboarding: (config?: OrganizationConfig) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to access the "backend database" of users
const getUsersList = (): User[] => {
  try {
    const stored = localStorage.getItem('orderly_users_list');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUsersList = (users: User[]) => {
  localStorage.setItem('orderly_users_list', JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isEarlyAccess = true;

  // Sync current user to localStorage (session)
  const saveSession = (u: User | null) => {
    if (u) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(u));
      // Also update the "database"
      const all = getUsersList();
      const idx = all.findIndex(exist => exist.id === u.id);
      if (idx >= 0) {
        all[idx] = u;
        saveUsersList(all);
      } else {
        saveUsersList([...all, u]);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
    setUser(u);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Refresh from "database" if possible to get latest state
        const all = getUsersList();
        const fresh = all.find(u => u.id === parsed.id) || parsed;
        setUser(fresh);
      } catch (e) {
        console.error("Failed to parse stored user", e);
        localStorage.removeItem(STORAGE_KEY_USER);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // 1. Try to find in "database"
      const allUsers = getUsersList();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
        saveSession(existingUser);
        return;
      }

      // 2. Fallback: Demo logic (keep old behavior for testing if no match)
      const isDemo = email.toLowerCase().includes('demo');
      if (isDemo) {
        const mockUser: User = {
          id: 'usr_demo',
          name: 'Demo Admin',
          email: email,
          phoneNumber: '+0000000000',
          role: 'admin',
          businessId: 'biz_demo',
          hasCompletedOnboarding: true,
          // Legacy
          organizationId: 'biz_demo',
          organizationName: 'Demo Business',
          subscriptionPlan: 'pro',
          region: 'GLOBAL',
          currency: 'USD'
        };
        saveSession(mockUser);
        return;
      }

      throw new Error("User not found. Please Sign Up.");

    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (bizName: string, email: string, phoneNumber: string, plan: SubscriptionPlan, region: BusinessRegion) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Modified Rule: Signup creates USER. Business is created LATER.
      // We ignore bizName/plan here for business creation purposes.
      // We accept them to satisfy interface, but User.businessId starts blank.

      const newUser: User = {
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        name: email.split('@')[0],
        email: email,
        phoneNumber: phoneNumber,
        role: 'admin', // Creator is admin
        businessId: '', // EMPTY -> Triggers onboarding
        // Legacy fields - empty or default
        organizationName: '',
        organizationId: '',
        subscriptionPlan: 'free',
        region: region,
        currency: 'USD',
        hasCompletedOnboarding: false,
      };

      // Check if exists
      const all = getUsersList();
      if (all.find(u => u.email === email)) {
        throw new Error("User already exists");
      }

      saveSession(newUser);

    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const upgradePlan = async (plan: SubscriptionPlan) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      // Only updates local user state for legacy support. 
      // Plan management should happen via useBusiness hook in real UI.
      const updated = { ...user, subscriptionPlan: plan };
      saveSession(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    saveSession(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...updates };
      saveSession(updated);
    }
  };

  const updateConfig = (config: OrganizationConfig) => {
    if (user) {
      const updated = { ...user, config };
      saveSession(updated);
    }
  };

  const completeOnboarding = (config?: OrganizationConfig) => {
    if (user) {
      const updated = {
        ...user,
        config: config || user.config,
        hasCompletedOnboarding: true
      };
      saveSession(updated);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isEarlyAccess, login, signup, upgradePlan, logout, updateUser, updateConfig, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
