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

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- EmailJS
- Vercel Analytics

## Creator

This project was created with love and code by Walid Bichri.

## License

All Rights Reserved.
