'use client';
import { useState } from 'react';
import { api } from '@/lib/api';
import { setToken, setUser } from '@/lib/auth';

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.register({ email, password, companyName });
      if (response.access_token) {
        setToken(response.access_token);
        const payload = JSON.parse(atob(response.access_token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          companyId: payload.companyId
        });
        onSuccess();
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 disabled:opacity-50"
      >
        {loading ? 'Creating Company...' : 'Create Company'}
      </button>
    </form>
  );
}