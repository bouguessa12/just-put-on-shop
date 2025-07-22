'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === 'mohamedalaabouguessa@gmail.com' && password === 'jsp-shop-123') {
      localStorage.setItem('isAdmin', 'true');
      router.replace('/admin/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 border-t-8 border-purple-600">
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.jpg" alt="Logo" className="w-20 h-20 rounded-full shadow-lg mb-2 border-4 border-purple-200" />
          <h2 className="text-3xl font-extrabold mb-1 text-purple-800 tracking-tight">Admin Login</h2>
          <p className="text-gray-500 text-sm">Sign in to access the admin dashboard</p>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
          required
        />
        {error && <div className="text-red-600 text-sm text-center font-semibold">{error}</div>}
        <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-green-500 text-white py-3 rounded-lg font-bold text-lg mt-2 shadow-lg hover:from-purple-700 hover:to-green-600 transition-all">Login</button>
      </form>
    </div>
  );
}
