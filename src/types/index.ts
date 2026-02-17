// FILE: src/types/index.ts
export interface GiftSuggestion {
  id: number;
  name: string;
  description: string;
  link: string;
  reason: string; // Add this line
  imageUrl?: string; // Optional image URL for real product images
  image?: string; // URL to the gift image
  price?: string; // Price as a string, e.g. "$29.99"
  tag?: string; // Optional informational badge/tag
}

export interface FormErrors {
  occasion?: string;
  relationship?: string;
  interests?: string;
  budget?: string;
}

export interface FormData {
  age: number;
  relationship: string;
  occasion: string;
  interests: string;
  budget: string;
}

export type ToastType = 'success' | 'error';
