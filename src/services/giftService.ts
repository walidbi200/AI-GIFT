import type { GiftSuggestion, FormData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse {
  suggestions: GiftSuggestion[];
}

export interface ApiError {
  error: string;
}

export class GiftService {
  static async generateGiftSuggestions(
    formData: FormData
  ): Promise<GiftSuggestion[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-gifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          age: formData.age,
          relationship: formData.relationship,
          occasion: formData.occasion,
          interests: formData.interests,
          budget: formData.budget || undefined,
        }),
      });

      if (!response.ok) {
        const errorData: ApiError = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const suggestions = await response.json();
      return suggestions;
    } catch (error) {
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('API key not configured')) {
          throw new Error(
            'AI service is not configured. Please contact support.'
          );
        } else if (error.message.includes('rate limit')) {
          throw new Error(
            'Too many requests. Please wait a moment and try again.'
          );
        } else if (error.message.includes('network')) {
          throw new Error(
            'Network error. Please check your connection and try again.'
          );
        } else {
          throw new Error(
            'Failed to generate gift suggestions. Please try again.'
          );
        }
      }

      throw new Error('An unexpected error occurred. Please try again.');
    }
  }

  // Fallback method for development/testing when API is not available
  static async generateMockSuggestions(
    formData: FormData
  ): Promise<GiftSuggestion[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockSuggestions: GiftSuggestion[] = [
      {
        id: 1,
        name: '📸 Polaroid Go Camera',
        description: `Perfect for a ${formData.age}-year-old ${formData.relationship} who loves capturing memories. Great for ${formData.occasion}!`,
        link: 'https://amazon.com',
        reason: 'Perfect for capturing memories and moments',
      },
      {
        id: 2,
        name: '🎮 Retro Game Console',
        description: `A nostalgic gaming experience that combines classic fun with modern convenience. Ideal for a ${formData.relationship} on ${formData.occasion}.`,
        link: 'https://amazon.com',
        reason: 'Great for gaming enthusiasts and nostalgia lovers',
      },
      {
        id: 3,
        name: '📚 Personalized Book Collection',
        description: `Curated books based on their interests and reading level. A thoughtful ${formData.occasion} gift for your ${formData.relationship}.`,
        link: 'https://amazon.com',
        reason: 'Thoughtful and educational gift choice',
      },
      {
        id: 4,
        name: '🎨 Creative Art Kit',
        description: `High-quality art supplies for unleashing creativity. Perfect for a ${formData.relationship} who loves artistic expression.`,
        link: 'https://amazon.com',
        reason: 'Encourages creativity and artistic expression',
      },
      {
        id: 5,
        name: '🏠 Smart Home Device',
        description: `Modern tech gadget to make their home smarter and more convenient. Great for a ${formData.relationship} on ${formData.occasion}!`,
        link: 'https://amazon.com',
        reason: 'Modern and practical tech solution',
      },
    ];

    return mockSuggestions;
  }
}
