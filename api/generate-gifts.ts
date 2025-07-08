// Create a new folder named "api" in the root of your project.
// Inside that "api" folder, create a new file named "generate-gifts.ts".
// Paste all of the following code into that new file.

import type { VercelRequest, VercelResponse } from '@vercel/node';

// This is the main function that will be executed by Vercel
export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only allow POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Only POST requests are allowed' });
  }

  // Get the form data from the request body
  const { age, relationship, occasion, interests, budget } = request.body;

  // Basic validation to ensure we have the data we need
  if (!age || !relationship || !occasion || !interests) {
    return response.status(400).json({ message: 'Missing required fields' });
  }

  // Get the OpenAI API key from the environment variables you set up in Vercel
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ message: 'OpenAI API key is not configured.' });
  }

  // --- Construct the Prompt for the AI ---
  // This is where we tell the AI exactly what we want.
  const prompt = `
    You are an expert gift recommender. Generate 5 unique and thoughtful gift suggestions based on the following details.
    For each suggestion, provide a "name" (with a relevant emoji) and a short "description" (around 15-20 words).
    The response must be a valid JSON array of objects.

    Details:
    - Recipient's Age: ${age}
    - Relationship to Recipient: ${relationship}
    - Occasion: ${occasion}
    - Recipient's Interests: ${interests}
    ${budget ? `- Budget: Under $${budget}` : ''}

    Example Output Format:
    [
      { "id": "1", "name": "🎁 Example Gift", "description": "This is an example description.", "link": "https://www.amazon.com/s?k=Example+Gift" },
      { "id": "2", "name": "✨ Another Gift", "description": "This is another example description.", "link": "https://www.google.com/search?q=Another+Gift" }
    ]
  `;

  try {
    // --- Call the OpenAI API ---
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // You can change this to gpt-4 if you prefer
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8, // A higher value (0.7-1.2) encourages more creative and varied responses
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      // If OpenAI returns an error, send it back to the client
      const errorData = await openAIResponse.json();
      console.error('OpenAI API Error:', errorData);
      return response.status(openAIResponse.status).json({ message: 'Error from OpenAI API', details: errorData });
    }

    const data = await openAIResponse.json();
    const suggestionsText = data.choices[0].message.content;

    // --- Send the Successful Response ---
    // We will parse the text from the AI to ensure it's valid JSON before sending
    try {
      const suggestions = JSON.parse(suggestionsText);
      return response.status(200).json(suggestions);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return response.status(500).json({ message: 'Failed to parse suggestions from AI response.' });
    }

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ message: 'An unexpected error occurred.' });
  }
}