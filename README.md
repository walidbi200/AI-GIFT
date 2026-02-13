# Smart Gift Finder

An AI-powered gift recommendation platform that helps you find the perfect gifts for your loved ones.

## Features

- 🤖 AI-powered gift recommendations
- 🎯 Personalized suggestions based on age, interests, and occasion
- 💰 Budget-friendly options
- 📱 Responsive design
- ⚡ Fast and intuitive interface

## Pages

### Home Page (/)

The main gift recommendation interface with a comprehensive form for gathering recipient information.

### About Page (/about)

A clean, minimalist page that explains:

- What Smart Gift Finder does
- How the AI technology works
- The story behind the project's creation
- Company values and mission

### Contact Page (/contact)

A contact form with:

- Name, Email, and Message fields
- Form validation
- EmailJS integration for sending emails
- Success/error feedback
- FAQ section

## EmailJS Setup

To enable the contact form functionality, you need to set up EmailJS:

1. Sign up for a free account at [EmailJS](https://www.emailjs.com/)
2. Create an Email Service (Gmail, Outlook, etc.)
3. Create an Email Template
4. Get your Service ID, Template ID, and Public Key
5. Update the Contact component with your credentials:

```typescript
// In src/pages/Contact.tsx, replace these placeholders:
await emailjs.send(
  "YOUR_SERVICE_ID", // Replace with your EmailJS service ID
  "YOUR_TEMPLATE_ID", // Replace with your EmailJS template ID
  templateParams,
  "YOUR_PUBLIC_KEY", // Replace with your EmailJS public key
);
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start API server (in separate terminal)
npm run dev:api

# Start both frontend and API
npm run dev:full
```

## Caching Strategy

This application uses **Redis caching** (via Upstash) to reduce OpenAI API costs by ~70%.

### Setup

1. Create a free Upstash account at https://upstash.com
2. Create a Redis database (Regional - free tier)
3. Add credentials to Vercel environment variables:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

### How It Works

- Gift recommendations are cached for **7 days**
- Cache keys are generated from normalized user inputs
- Cache hits return results instantly (< 200ms)
- Cache misses call OpenAI API and store the result
- **Expected cost savings**: 50-70% reduction

### Monitoring

- **Cache statistics**: Visit `/api/cache-stats`
- **Clear cache** (admin only): POST to `/api/admin/clear-cache` with JWT token
- Check Vercel logs for cache hit/miss ratio

### Cost Impact

| Scenario | Monthly Cost | Savings |
|----------|-------------|---------|
| Without caching | ~$60 | - |
| With 50% cache hit rate | ~$30 | 50% |
| With 70% cache hit rate | ~$18 | 70% |

See [docs/COST_OPTIMIZATION.md](docs/COST_OPTIMIZATION.md) for detailed information.

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- EmailJS
- Vercel Analytics
- OpenAI API (GPT-3.5-turbo)
- Upstash Redis (caching)
- Jose (JWT authentication)
- Bcrypt (password hashing)

## Creator

This project was created with love and code by Walid Bichri.

## License

All Rights Reserved.
