
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { UserPlus, Shield, User as UserIcon, Mail, Trash2, Clock } from 'lucide-react'; // ✅ Added Clock
import { PLAN_LIMITS } from '../../constants';

export const StaffManagement: React.FC = () => {
  const { user, isEarlyAccess } = useAuth(); // ✅ Added isEarlyAccess
  const limits = PLAN_LIMITS[user?.subscriptionPlan || 'free'];

  const [staff] = useState([ // ✅ Removed setter, kept only current user
    { id: 's1', name: 'You', email: user?.email, role: 'Admin', status: 'Active' },
    // ✅ Removed hardcoded demo users (Sarah Miller, Mike Johnson)
  ]);

  const canAddMore = !isEarlyAccess && staff.length < (limits.maxStaff === Infinity ? 999 : limits.maxStaff + 1); // ✅ Block adding in Beta

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Team Members</h1>
          <p className="text-gray-500 dark:text-gray-400">Invite your team to help process WhatsApp orders.</p>
        </div>
        {!isEarlyAccess ? ( // ✅ Conditional rendering for button
          <Button
            disabled={!canAddMore}
            className="flex items-center space-x-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Invite Staff</span>
          </Button>
        ) : (
          <div className="flex items-center space-x-2 text-primary font-bold bg-primary/10 px-4 py-2 rounded-xl">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Coming Soon After Beta</span>
          </div>
        )}
      </div>

      {isEarlyAccess && ( // ✅ Early Access Info Block
        <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-center space-x-6 animate-in zoom-in duration-500">
          <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3 flex-shrink-0">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-charcoal tracking-tight">Staff Management is Restricted</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">To maintain system stability during the Early Access Beta, multi-user access is temporarily disabled. <span className="text-primary font-bold">Founding users will be the first to unlock full team collaboration when beta concludes.</span></p>
          </div>
        </div>
      )}

      {/* ✅ Removed Plan Limit Warning (irrelevant for beta) */}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden opacity-90">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-50 dark:border-gray-800">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <UserIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold dark:text-white">{member.name}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Shield className={`h-4 w-4 ${member.role === 'Admin' ? 'text-primary' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium dark:text-gray-300">{member.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${member.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-500'}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* ✅ Restricted actions in beta */}
                    <div className="h-2 w-12 bg-gray-100 rounded ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
