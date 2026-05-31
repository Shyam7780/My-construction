import supabase from './db-client.js';

// Helper to verify admin token
function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@chhotanram.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@2025';
  const expectedToken = Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64');
  
  return token === expectedToken;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('construction_packages')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id, name, description, badge, features } = req.body;

      if (!id || !name || !description || !features) {
        return res.status(400).json({ error: 'ID, Name, Description, and Features are required.' });
      }

      // Check if features is a valid array or JSON
      const parsedFeatures = Array.isArray(features) ? features : JSON.parse(features);

      const { data, error } = await supabase
        .from('construction_packages')
        .update({
          name,
          description,
          badge,
          features: parsedFeatures,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Packages API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
