import supabase from './db-client.js';

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    
    // Check credentials against environment variables or secure defaults
    const adminEmail = process.env.ADMIN_EMAIL || 'ramchhotan63@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Ram@#9798';

    if (email === adminEmail && password === adminPassword) {
      // Generate a secure token based on credentials
      const token = Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64');
      return res.status(200).json({ 
        success: true,
        token, 
        email,
        message: 'Authentication successful'
      });
    } else {
      return res.status(401).json({ error: 'Invalid admin email or password' });
    }
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
