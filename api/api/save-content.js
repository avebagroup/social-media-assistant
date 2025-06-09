// This file saves generated content to database
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand, platform, pillar, topic, content, userEmail } = req.body;

    // Save to database
    const { data, error } = await supabase
      .from('content_generated')
      .insert([
        {
          brand,
          platform,
          pillar,
          topic,
          generated_content: content,
          user_email: userEmail || 'anonymous'
        }
      ]);

    if (error) throw error;

    // Also track usage stats
    await supabase
      .from('usage_stats')
      .insert([{ brand, platform }]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ error: 'Failed to save content' });
  }
}
