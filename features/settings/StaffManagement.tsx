import React, { useState } from 'react';
import { useStaff } from '../../hooks/useStaff';
import { useAuth } from '../../hooks/useAuth';
import { useBusiness } from '../../hooks/useBusiness';

export const StaffManagement: React.FC = () => {
    const { user } = useAuth();
    const { business } = useBusiness();
    const { staff, addStaff, removeStaff, canAddStaff, isLoading, error } = useStaff();

    // UI Local State
    const [isAdding, setIsAdding] = useState(false);
    const [newStaffEmail, setNewStaffEmail] = useState('');
    const [newStaffName, setNewStaffName] = useState('');

    if (user?.role !== 'admin') {
        return <div className="p-8 text-center text-red-500">Access Denied. Admins only.</div>;
    }

    if (!business) {
        return <div className="p-8">No business detected in Staff Management.</div>;
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addStaff(newStaffEmail, newStaffName);
            setNewStaffEmail('');
            setNewStaffName('');
            setIsAdding(false);
        } catch (e) {
            alert(e);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this staff member?")) {
            await removeStaff(id);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
                    <p className="text-sm text-gray-500">Manage who has access to your business: {business.name}</p>
                </div>
                <div>
                    <span className="mr-4 text-xs font-medium px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Plan: {business.plan.toUpperCase()}
                    </span>

                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            disabled={!canAddStaff}
                            className={`px-4 py-2 bg-primary text-white text-sm font-medium rounded-md 
                              ${!canAddStaff ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                        >
                            {canAddStaff ? 'Add Staff' : 'Limit Reached'}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                    {error}
                </div>
            )}

            {/* Add Staff Form */}
            {isAdding && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Staff Member</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newStaffName}
                                    onChange={e => setNewStaffName(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={newStaffEmail}
                                    onChange={e => setNewStaffEmail(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                                {isLoading ? 'Adding...' : 'Send Invite'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Staff List */}
            <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {staff.length === 0 ? (
                        <li className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                            No staff members yet.
                        </li>
                    ) : (
                        staff.map((member) => (
                            <li key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150 ease-in-out">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                                    </div>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleDelete(member.id)}
                                        className="text-sm text-red-600 hover:text-red-900 border border-red-200 rounded px-3 py-1 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};
