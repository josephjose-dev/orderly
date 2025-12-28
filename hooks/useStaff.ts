import { useState, useCallback } from 'react';
import { User, Business, SubscriptionPlan } from '../types';
import { useAuth } from './useAuth';
import { useBusiness } from './useBusiness';

// Mock storage key for users (shared with useAuth)
import { STORAGE_KEY_USER } from '../constants';

export const useStaff = () => {
    const { user, updateUser } = useAuth();
    const { business } = useBusiness();

    // In a real app, we'd fetch from backend. Here we simulate looking up all users in localStorage
    // This is tricky with the current simple localStorage implementation which might only store the CURRENT user in 'orderly_user'.
    // However, the previous `useAuth` seemed to only store ONE user at `STORAGE_KEY_USER`.
    // If we want multiple staff, we need a way to store multiple users.
    // I will introduce a new storage key `orderly_users_list` to simulate a "Users Table".

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

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getStaff = useCallback(() => {
        if (!business) return [];
        const allUsers = getUsersList();
        // Return users belonging to this business, excluding the current user (if desired, or include them)
        // Usually staff list excludes the Admin looking at it, or includes them. Let's exclude current user for "Staff Management" list if they are admin?
        // The prompt says "List staff for business".
        return allUsers.filter(u => u.businessId === business.id && u.role === 'staff');
    }, [business]);

    const canAddStaff = useCallback(() => {
        if (!business) return false;
        const plan = business.plan;

        if (plan === 'free') return false; // Beta/Free -> No staff

        const currentStaffCount = getStaff().length;

        if (plan === 'business') {
            return currentStaffCount < 3; // Limit for business
        }

        if (plan === 'pro') return true; // Unlimited

        return false;
    }, [business, getStaff]);

    const addStaff = useCallback(async (email: string, name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (!user) throw new Error("Unauthorized");
            if (!business) throw new Error("No business found");

            if (!canAddStaff()) {
                throw new Error("Plan limit reached or not allowed.");
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const allUsers = getUsersList();
            if (allUsers.find(u => u.email === email)) {
                throw new Error("User already exists");
            }

            const newUser: User = {
                id: `usr_${Math.random().toString(36).substr(2, 9)}`,
                name,
                email,
                phoneNumber: '',
                role: 'staff',
                businessId: business.id,
                hasCompletedOnboarding: true, // Staff don't need to create business
                // Legacy
                organizationId: business.id,
                organizationName: business.name
            };

            const updatedList = [...allUsers, newUser];
            saveUsersList(updatedList);
            return newUser;
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [business, user, canAddStaff]);

    const removeStaff = useCallback(async (userId: string) => {
        setIsLoading(true);
        try {
            // Simulate API
            await new Promise(resolve => setTimeout(resolve, 500));
            const allUsers = getUsersList();
            const updatedList = allUsers.filter(u => u.id !== userId);
            saveUsersList(updatedList);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        staff: getStaff(),
        addStaff,
        removeStaff,
        canAddStaff: canAddStaff(),
        isLoading,
        error
    };
};
