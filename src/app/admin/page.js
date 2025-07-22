"use client";
import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock login: accept any non-empty username/password
    if (username.trim() && password.trim()) {
      setError('');
      router.push('/admin/dashboard');
    } else {
      setError('Please enter both username and password.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <Image src="/logo.jpg" alt="Just Put On Logo" width={80} height={80} className="rounded-full mb-4 shadow-lg" />
        <h1 className="text-2xl font-extrabold mb-2 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Admin Login</h1>
        <p className="text-gray-400 mb-6 text-center">Sign in to access the admin dashboard</p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 font-bold text-lg shadow-lg transition-all mt-2"
          >
            Login
          </button>
        </form>
        </div>
      </main>
  );
}
