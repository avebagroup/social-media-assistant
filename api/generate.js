// This file handles AI content generation
import brandKnowledge from '../../../lib/data/brand-knowledge.json';
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
  const brandData = brandKnowledge.aveba;
  const voice = brandData.brand_voice;
  const pillarData = brandData.content_pillars?.[pillar] || {};

  const openers = voice.sample_openers.map(o => `- ${o}`).join("\n");
  const closers = voice.sample_closers.map(c => `- ${c}`).join("\n");
  const phrases = voice.phrases_to_use.join(", ");

  const prompt = `
You are writing content for AVEBA, a creative ops agency that builds backend systems for digital businesses.

### BRAND VOICE
Tone: ${voice.tone}
Vibe: ${voice.vibe}
Style rules: ${voice.style_rules.join("; ")}
Messaging principles: ${voice.messaging_principles.join("; ")}

Sample Openers:
${openers}

Sample Closers:
${closers}

Phrases to Use:
${phrases}

### CONTENT REQUEST
Platform: ${platform}
Pillar: ${pillarData.definition || pillar}
Topic: ${topic}
Additional context: ${additional || 'None'}

Your tone = smart, witty, Taglish-coded but English-first, confident but never stiff. Be specific. Use line breaks. Start strong, end stronger. Make people feel seen. Avoid fluff.
`;

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
  return data.content?.[0]?.text || "Error: No content returned.";
}

// Function to generate Maxiemizer content using OpenAI
async function generateMaxiemizerContent(platform, angle, topic, additional) {
  const brandData = brandKnowledge.maxiemizer;
  const voice = brandData.brand_voice;
  const angleData = brandData.content_angles?.[angle] || {};

  const openers = voice.sample_openers.map(o => `- ${o}`).join("\n");
  const closers = voice.sample_closers.map(c => `- ${c}`).join("\n");
  const phrases = voice.phrases_to_use.join(", ");

  const prompt = `
You are creating content for MAXIEMIZER, a CRM system for Filipino service providers, architects, and builders.

### BRAND VOICE
Tone: ${voice.tone}
Style rules: ${voice.style_rules.join("; ")}
Messaging principles: ${voice.messaging_principles.join("; ")}

Sample Openers:
${openers}

Sample Closers:
${closers}

Phrases to Use:
${phrases}

### CONTENT REQUEST
Platform: ${platform}
Angle: ${angleData.definition || angle}
Topic: ${topic}
Additional context: ${additional || 'None'}

Your tone = clear, calm, supportive. Like the organized friend who gets you. Break lines for rhythm. Start strong. End stronger. Make the reader feel supported, not overwhelmed.
`;

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
  return data.choices?.[0]?.message?.content || "Error: No content returned.";
}
