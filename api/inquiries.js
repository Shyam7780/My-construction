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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Protected: Only admin can see inquiries
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase
        .from('construction_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      // Public: Anyone can submit an inquiry
      const { name, phone, area, service_type, package_tier, estimated_cost } = req.body;

      if (!name || !phone || !area || !service_type || !estimated_cost) {
        return res.status(400).json({ error: 'Missing required inquiry fields' });
      }

      const { data, error } = await supabase
        .from('construction_inquiries')
        .insert({
          name,
          phone,
          area: parseFloat(area),
          service_type,
          package_tier: service_type === 'Project with Material' ? package_tier : null,
          estimated_cost: parseFloat(estimated_cost),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      // Protected: Only admin can delete inquiries
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'Inquiry ID is required for deletion' });
      }

      const { error } = await supabase
        .from('construction_inquiries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Inquiry deleted successfully' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Inquiries API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
