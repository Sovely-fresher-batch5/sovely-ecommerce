import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { User, Lock, Bell, CreditCard, Shield, Image as ImageIcon } from 'lucide-react';

const Settings = () => {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('account');

    const tabs = [
        { id: 'account', label: 'Account Settings', icon: User },
        { id: 'billing', label: 'Billing & Subscription', icon: CreditCard },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    return (
        <div className="selection:bg-primary/30 flex min-h-screen flex-col bg-slate-50 font-sans">
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                        Settings
                    </h1>
                    <button className="bg-primary hover:bg-primary-light rounded-full px-6 py-2.5 font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                        Save Changes
                    </button>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm">
                    {/* Horizontal Tabs */}
                    <div className="flex overflow-x-auto border-b border-slate-100 px-6 pt-2 custom-scrollbar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex whitespace-nowrap items-center gap-2 border-b-2 px-4 py-4 font-bold transition-all ${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="p-8 lg:p-12">
                        {activeTab === 'account' && (
                            <div className="animate-in fade-in duration-300 max-w-3xl">
                                <h2 className="text-xl font-extrabold text-slate-900">Profile Information</h2>
                                <p className="mb-8 text-sm font-medium text-slate-500">
                                    Manage your personal details and keep your contact info up to date.
                                </p>

                                <div className="mb-8 flex items-center gap-6">
                                    <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-slate-50 bg-slate-100 text-2xl font-black text-slate-400 shadow-sm">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            user?.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                                            <ImageIcon size={16} /> Update
                                        </button>
                                        <button className="text-danger rounded-lg px-4 py-2 text-sm font-bold transition-colors hover:bg-red-50">
                                            Delete
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user?.name || ''}
                                                className="focus:border-primary focus:ring-primary rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-medium text-slate-900 transition-all outline-none focus:ring-1"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-bold text-slate-700">Email Address</label>
                                            <input
                                                type="email"
                                                defaultValue={user?.email || ''}
                                                className="focus:border-primary focus:ring-primary rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-medium text-slate-900 transition-all outline-none focus:ring-1"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:w-1/2 md:pr-3">
                                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            className="focus:border-primary focus:ring-primary rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-medium text-slate-900 transition-all outline-none focus:ring-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-in fade-in duration-300 max-w-3xl">
                                <h2 className="text-xl font-extrabold text-slate-900">Security Settings</h2>
                                <p className="mb-8 text-sm font-medium text-slate-500">
                                    Keep your account secure with extra authentication and alerts.
                                </p>

                                <div className="space-y-8">
                                    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Two-Factor Authentication</h3>
                                            <p className="text-sm font-medium text-slate-500">Add an extra layer of protection to your account.</p>
                                        </div>
                                        <div className="relative inline-block w-12 cursor-pointer align-middle select-none transition duration-200 ease-in">
                                            <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer" />
                                            <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-slate-300 cursor-pointer"></label>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-8">
                                        <h3 className="mb-6 text-lg font-bold text-slate-900">Password Management</h3>
                                        <div className="space-y-6 max-w-md">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700">Current Password</label>
                                                <input type="password" placeholder="••••••••" className="focus:border-primary focus:ring-primary rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-medium text-slate-900 transition-all outline-none focus:ring-1" />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-sm font-bold text-slate-700">New Password</label>
                                                <input type="password" placeholder="••••••••" className="focus:border-primary focus:ring-primary rounded-xl border border-slate-200 bg-slate-50 p-3.5 font-medium text-slate-900 transition-all outline-none focus:ring-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fallback for other tabs */}
                        {(activeTab === 'billing' || activeTab === 'notifications') && (
                            <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center py-16 text-center">
                                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Lock size={24} />
                                </div>
                                <h3 className="mb-2 text-lg font-bold text-slate-900">Feature Coming Soon</h3>
                                <p className="text-sm font-medium text-slate-500 max-w-sm">
                                    We are currently building out this section of the settings panel. Check back soon!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <style dangerouslySetInnerHTML={{__html: `
                .toggle-checkbox:checked { right: 0; border-color: #10b981; }
                .toggle-checkbox:checked + .toggle-label { background-color: #10b981; }
                .toggle-checkbox { right: 24px; z-index: 1; border-color: #cbd5e1; transition: all 0.3s; }
                .toggle-label { transition: all 0.3s; }
            `}} />
        </div>
    );
};

export default Settings;