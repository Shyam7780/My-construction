import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ShieldAlert, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  // ASLI API CALL: Backend verify karega
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_email', data.email);
        navigate('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <Navbar />

      <div 
        className="flex-grow flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 bg-cover bg-center"
        style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url('/images/admin-bg.jpg')` }}
      >
        <div className="max-w-md w-full space-y-8 bg-zinc-950/90 border border-yellow-500/20 p-8 sm:p-10 rounded-3xl shadow-2xl backdrop-blur-md">
          
          <div className="text-center space-y-3">
            <div className="mx-auto bg-yellow-400 text-black p-3.5 rounded-2xl w-fit shadow-lg shadow-yellow-400/20">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">
              Admin Gateway
            </h2>
            <p className="text-zinc-400 text-sm">
              Please enter your high-security credentials to access the construction rate manager and customer inquiry vault.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Admin Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-400">
                  Admin Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-600">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-yellow-400 transition"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-black bg-yellow-400 hover:bg-yellow-500 text-black transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-yellow-400/10 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>

        </div>
      </div>

      <Footer />
    </div>
  );
}