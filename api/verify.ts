export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    const serverPassword = process.env.ACCESS_PASSWORD;

    // If no password is configured on the server, allow access (Open Mode)
    // This ensures the app works by default if the user hasn't set up security yet.
    if (!serverPassword) {
      return res.status(200).json({ success: true, message: 'Open Access' });
    }

    if (password === serverPassword) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(401).json({ error: 'Incorrect password' });
    }
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}