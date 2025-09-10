import React from 'react';
import type { User } from '../types';
import { CreditCardIcon, SparklesIcon, UserCircleIcon } from './icons';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const SettingsCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-brand-gray-200">
    <div className="flex items-center mb-4">
      {icon}
      <h3 className="text-xl font-semibold ml-3 text-brand-gray-800">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row justify-between sm:items-center">
    <p className="font-medium text-brand-gray-600">{label}</p>
    <p className="text-brand-gray-900">{value}</p>
  </div>
);

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  const handleAction = (action: string) => {
    alert(`${action} functionality is not implemented in this demo.`);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Account Settings</h2>
        <p className="text-brand-gray-700 mt-1">Manage your profile, subscription, and payment details.</p>
      </div>
      
      <div className="space-y-6">
        {/* Profile Details */}
        <SettingsCard title="Profile Details" icon={<UserCircleIcon className="w-6 h-6 text-brand-blue" />}>
          <InfoRow label="Full Name" value={user.name} />
          <hr className="border-brand-gray-200" />
          <InfoRow label="Email Address" value={user.email} />
          <div className="text-right mt-4">
            <button 
              onClick={() => handleAction('Edit Profile')}
              className="font-semibold text-sm text-brand-blue hover:text-brand-blue-dark transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </SettingsCard>

        {/* Subscription Plan */}
        <SettingsCard title="Subscription Plan" icon={<SparklesIcon className="w-6 h-6 text-brand-blue" />}>
          <InfoRow label="Current Plan" value={user.subscription.plan} />
          <hr className="border-brand-gray-200" />
          <InfoRow label="Status" value={user.subscription.status} />
           <hr className="border-brand-gray-200" />
          <InfoRow label="Renews On" value={user.subscription.renewsOn} />
          <div className="text-right mt-4">
            <button 
              onClick={() => handleAction('Manage Subscription')}
              className="font-semibold text-sm text-brand-blue hover:text-brand-blue-dark transition-colors"
            >
              Manage Subscription
            </button>
          </div>
        </SettingsCard>

        {/* Payment Method */}
        <SettingsCard title="Payment Method" icon={<CreditCardIcon className="w-6 h-6 text-brand-blue" />}>
          <InfoRow label="Card" value={`${user.paymentMethod.cardType} ending in ${user.paymentMethod.last4}`} />
          <hr className="border-brand-gray-200" />
          <InfoRow label="Expires" value={user.paymentMethod.expires} />
          <div className="text-right mt-4">
            <button 
              onClick={() => handleAction('Update Payment')}
              className="font-semibold text-sm text-brand-blue hover:text-brand-blue-dark transition-colors"
            >
              Update Payment Method
            </button>
          </div>
        </SettingsCard>
        
        {/* Danger Zone */}
        <div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h3>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-red-300 flex justify-between items-center">
            <p className="text-sm text-brand-gray-700">Permanently delete your account and all of your data.</p>
            <button 
              onClick={() => handleAction('Delete Account')}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};