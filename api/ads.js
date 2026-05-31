import supabase from './db-client.js';

// Helper to verify admin token
function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return false;
  
  const adminEmail = process.env.ADMIN_EMAIL || 'ramchhotan63@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Ram@#9798';
  const expectedToken = Buffer.from(`${adminEmail}:${adminPassword}`).toString('base64');
  
  return token === expectedToken;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // If admin token is provided, fetch all ads. Otherwise, only fetch active ads.
      const isAdmin = verifyAdmin(req);
      
      let query = supabase.from('construction_ads').select('*');
      if (!isAdmin) {
        query = query.eq('is_active', true);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { title, description, badge, is_active } = req.body;
      if (!title || !description || !badge) {
        return res.status(400).json({ error: 'Title, description, and badge are required.' });
      }

      const { data, error } = await supabase
        .from('construction_ads')
        .insert({
          title,
          description,
          badge,
          is_active: is_active ?? true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'PUT') {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id, title, description, badge, is_active } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Ad ID is required for update.' });
      }

      const { data, error } = await supabase
        .from('construction_ads')
        .update({
          title,
          description,
          badge,
          is_active,
          created_at: new Date().toISOString() // refresh timestamp
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'DELETE') {
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Ad ID is required for deletion.' });
      }

      const { error } = await supabase
        .from('construction_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Ad deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Ads API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
