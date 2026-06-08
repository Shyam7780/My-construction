import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldAlert, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { loginAdmin } from '../api'; 

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) navigate('/admin/dashboard');
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginAdmin({ email, password });
      if (res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_email', email);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="max-w-md w-full space-y-6 bg-zinc-950 p-8 border border-yellow-500/20 rounded-3xl">
          <h2 className="text-2xl font-black text-center">ADMIN LOGIN</h2>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900 p-4 rounded-xl" />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="w-full bg-zinc-900 p-4 rounded-xl" />
          <button type="submit" disabled={loading} className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold">
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}