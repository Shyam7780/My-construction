import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api'; // सुनिश्चित करें कि आपका api.js का पाथ सही है

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // पेज रिफ्रेश होने से रोकेगा
    setLoading(true);
    setError('');

    try {
      const res = await loginAdmin({ email, password });
      
      // टोकन को सुरक्षित करें
      if (res.data && res.data.token) {
        localStorage.setItem('admin_token', res.data.token);
        navigate('/admin/dashboard'); // सफल होने पर डैशबोर्ड पर भेजें
      } else {
        setError('Login failed: No token received');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Admin Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Access Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;