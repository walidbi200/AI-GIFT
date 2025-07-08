// FILE: api/generate-gifts.ts
// This version includes proper types and error handling for the backend API.

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
    For each suggestion, provide a "name" (with a relevant emoji) and a short "description" (around 15-20 words).
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
      { "id": "1", "name": "🎁 Example Gift", "description": "This is an example description." },
      { "id": "2", "name": "✨ Another Gift", "description": "This is another example description." }
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
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json();
      console.error('OpenAI API Error:', errorData);
      return response.status(openAIResponse.status).json({ message: 'Error from OpenAI API', details: errorData });
    }

    const data = await openAIResponse.json();
    
    if (!data.choices || data.choices.length === 0 || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('Invalid response structure from OpenAI:', data);
        return response.status(500).json({ message: 'Received an invalid response structure from OpenAI.' });
    }

    const suggestionsText = data.choices[0].message.content;
    const jsonStartIndex = suggestionsText.indexOf('[');
    const jsonEndIndex = suggestionsText.lastIndexOf(']');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        console.error('Could not find JSON array in the AI response:', suggestionsText);
        return response.status(500).json({ message: 'Could not find JSON array in the AI response.' });
    }

    const jsonString = suggestionsText.substring(jsonStartIndex, jsonEndIndex + 1);

    try {
      let suggestions = JSON.parse(jsonString);
      // Add affiliate links
      suggestions = suggestions.map((suggestion: any) => ({
        ...suggestion,
        link: `https://www.amazon.com/s?k=${encodeURIComponent(suggestion.name)}&tag=${affiliateTag}`
      }));
      return response.status(200).json(suggestions);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, '--- Original Text:', jsonString);
      return response.status(500).json({ message: 'Failed to parse suggestions from AI response.' });
    }

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An unexpected error occurred.' });
  }
}
