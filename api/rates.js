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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      // Fetch rates from v2 table (always id = 1)
      const { data, error } = await supabase
        .from('construction_rates_v2')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // If rates do not exist yet, insert the default row and return it
        const defaultRates = {
          id: 1,
          labor_only: 280,
          basic: 1400,
          standard: 1800,
          premium: 2400,
          renovation: 180,
          updated_at: new Date().toISOString()
        };

        const { data: inserted, error: insertError } = await supabase
          .from('construction_rates_v2')
          .insert(defaultRates)
          .select()
          .single();

        if (insertError) throw insertError;
        return res.status(200).json(inserted);
      }

      return res.status(200).json(data);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Protected endpoint
      if (!verifyAdmin(req)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { labor_only, basic, standard, premium, renovation } = req.body;

      if (
        labor_only === undefined || 
        basic === undefined || 
        standard === undefined || 
        premium === undefined ||
        renovation === undefined
      ) {
        return res.status(400).json({ error: 'All rates are required' });
      }

      const { data, error } = await supabase
        .from('construction_rates_v2')
        .update({
          labor_only: parseFloat(labor_only),
          basic: parseFloat(basic),
          standard: parseFloat(standard),
          premium: parseFloat(premium),
          renovation: parseFloat(renovation),
          updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Rates API Error:', err);
    res.status(500).json({ error: err.message });
  }
}
