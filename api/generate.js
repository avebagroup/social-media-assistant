// This file handles AI content generation
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { brand, platform, pillar, topic, additional } = req.body;

    // Choose which AI to use based on brand
    let content;
    if (brand === 'aveba') {
      content = await generateAvebaContent(platform, pillar, topic, additional);
    } else {
      content = await generateMaxiemizerContent(platform, pillar, topic, additional);
    }

    res.status(200).json({ content });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
}

// Function to generate Aveba content using Claude AI
async function generateAvebaContent(platform, pillar, topic, additional) {
  const prompt = `You are a social media expert creating content for AVEBA, a creative operations agency.

BRAND VOICE: Chill but pro. Direct, warm, strategic. Bestie vibes but knows what she's doing.

CONTENT PILLAR: ${pillar}
PLATFORM: ${platform}
TOPIC: ${topic}
ADDITIONAL CONTEXT: ${additional || 'None'}

Create platform-appropriate content that matches Aveba's voice perfectly. Include relevant hashtags if needed.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });

  const data = await response.json();
  return data.content[0].text;
}

// Function to generate Maxiemizer content using OpenAI
async function generateMaxiemizerContent(platform, angle, topic, additional) {
  const prompt = `You are creating content for MAXIEMIZER, a CRM system for Filipino builders and architects.

BRAND VOICE: Calm & competent. No hype. Clear, confident answers. Supportive. Builder-first examples.

CONTENT ANGLE: ${angle}
PLATFORM: ${platform}
TOPIC: ${topic}
ADDITIONAL CONTEXT: ${additional || 'None'}

Create content that speaks to Filipino builders/architects who are tired of manual processes. Keep it practical and straightforward.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: prompt
      }],
      max_tokens: 800,
      temperature: 0.7
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
