
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';

interface Organization {
  name: string;
  currency: string;
}

interface OrganizationContextType {
  organization: Organization;
  updateOrganization: (updates: Partial<Organization>) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization>({
    name: 'Orderly Business',
    currency: 'USD',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Sync data when user (and thus organizationId) changes
  useEffect(() => {
    if (!user?.organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storageKey = `org:${user.organizationId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        setOrganization(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse organization data", e);
      }
    } else {
      // Initialize with user's signup info if no specific settings saved yet
      setOrganization({
        name: user.organizationName || 'Orderly Business',
        currency: user.currency || 'USD',
      });
    }
    setIsLoading(false);
  }, [user?.organizationId, user?.organizationName, user?.currency]);

  const updateOrganization = (updates: Partial<Organization>) => {
    if (!user?.organizationId) return;

    setOrganization((prev) => {
      const updated = { ...prev, ...updates };
      const storageKey = `org:${user.organizationId}`;
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <OrganizationContext.Provider value={{ organization, updateOrganization, isLoading }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
