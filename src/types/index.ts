export interface GiftSuggestion {
  id: number
  name: string
  description: string
  link: string
}

export interface FormErrors {
  occasion?: string
  relationship?: string
  interests?: string
  budget?: string
}

export interface FormData {
  age: number
  relationship: string
  occasion: string
  interests: string
  budget: string
}

export type ToastType = 'success' | 'error' 