// FILE: api/generate-gifts.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { age, relationship, occasion, interests, budget, negativeKeywords } = request.body;
  const apiKey = process.env.OPENAI_API_KEY;
  const affiliateTag = process.env.AMAZON_AFFILIATE_TAG || 'walidgifts-20';

  if (!apiKey) {
    return response.status(500).json({ message: 'OpenAI API key is not configured.' });
  }

  const prompt = `
    You are an expert gift recommender. Generate 5 unique and thoughtful gift suggestions based on the following details.
    For each suggestion, provide a "name" (with a relevant emoji), a short "description" (around 15-20 words), and a "reason" (a sentence explaining why it's a great choice).
    Do NOT include any links. Avoid the following things: ${negativeKeywords || 'none'}.
    The response MUST be a valid JSON array of objects, and nothing else. Do not include any text before or after the JSON array.

    Details:
    - Recipient's Age: ${age}
    - Relationship to Recipient: ${relationship}
    - Occasion: ${occasion}
    - Recipient's Interests: ${interests}
    ${budget ? `- Budget: Under $${budget}` : ''}

    Example Output Format:
    [
      { "id": "1", "name": "🎁 Example Gift", "description": "This is an example description.", "reason": "This is a great gift because..." },
      { "id": "2", "name": "✨ Another Gift", "description": "This is another example description.", "reason": "We love this because..." }
    ]
  `;

  try {
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 800,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      return response.status(openAIResponse.status).json({ message: 'Error from OpenAI API', details: errorData });
    }

    const data = await openAIResponse.json();
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        return response.status(500).json({ message: 'Received an invalid response structure from OpenAI.' });
    }

    const suggestionsText = data.choices[0].message.content;
    const jsonStartIndex = suggestionsText.indexOf('[');
    const jsonEndIndex = suggestionsText.lastIndexOf(']');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        return response.status(500).json({ message: 'Could not find JSON array in the AI response.' });
    }

    const jsonString = suggestionsText.substring(jsonStartIndex, jsonEndIndex + 1);

    try {
      let suggestions = JSON.parse(jsonString);
      // Reliably generate a search link for each product
      suggestions = suggestions.map((suggestion: any) => ({
        ...suggestion,
        link: `https://www.amazon.com/s?k=${encodeURIComponent(suggestion.name)}&tag=${affiliateTag}`
      }));
      return response.status(200).json(suggestions);
    } catch (parseError) {
      return response.status(500).json({ message: 'Failed to parse suggestions from AI response.' });
    }

  } catch (error) {
    return response.status(500).json({ message: 'An unexpected error occurred.' });
  }
}