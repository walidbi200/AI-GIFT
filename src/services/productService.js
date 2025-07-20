// src/services/productService.js

async function getFeaturedProducts() {
  // Placeholder: return a hardcoded array of sample products
  return [
    {
      id: 1,
      name: 'AI Smart Speaker',
      price: 99.99,
      image: 'https://example.com/speaker.jpg',
      description: 'A voice-controlled smart speaker with AI assistant.'
    },
    {
      id: 2,
      name: 'Wireless Headphones',
      price: 59.99,
      image: 'https://example.com/headphones.jpg',
      description: 'Noise-cancelling over-ear headphones for immersive sound.'
    },
    {
      id: 3,
      name: 'Fitness Tracker',
      price: 39.99,
      image: 'https://example.com/tracker.jpg',
      description: 'Track your steps, heart rate, and sleep with this smart wearable.'
    }
  ];
}

module.exports = {
  getFeaturedProducts
}; 