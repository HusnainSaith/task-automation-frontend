'use client';
import { useState, useEffect } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import OwnerDashboard from '@/components/dashboard/OwnerDashboard';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import ServicemanDashboard from '@/components/dashboard/ServicemanDashboard';
import { getUser, getToken, logout } from '@/lib/auth';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const token = getToken();
    if (token && !user) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          companyId: payload.companyId
        });
      } catch (err) {
        logout();
      }
    }
  }, [mounted, user]);

  const handleAuthSuccess = () => {
    setUser(getUser());
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">FS</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              FieldService Pro
            </h1>
            <p className="text-gray-600">Professional Field Service Management</p>
          </div>
          
          {showRegister ? (
            <>
              <RegisterForm onSuccess={handleAuthSuccess} />
              <p className="mt-6 text-center text-sm text-gray-600">
                Already have a company?{' '}
                <button
                  onClick={() => setShowRegister(false)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Login here
                </button>
              </p>
            </>
          ) : (
            <>
              <LoginForm onSuccess={handleAuthSuccess} />
              <p className="mt-6 text-center text-sm text-gray-600">
                Need to create a company?{' '}
                <button
                  onClick={() => setShowRegister(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Register here
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FS</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  FieldService Pro
                </h1>
                <p className="text-sm text-gray-500">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {user.role === 'owner' && <OwnerDashboard />}
        {user.role === 'client' && <ClientDashboard />}
        {user.role === 'serviceman' && <ServicemanDashboard />}
      </main>
    </div>
  );
}
