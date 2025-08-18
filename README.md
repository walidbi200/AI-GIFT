# AI-GFT: AI-Powered Gift Recommendation & Blog Platform

A modern, enterprise-grade application that combines AI-powered gift recommendations with a comprehensive blog publishing system.

## 🚀 Features

- **AI-Powered Gift Recommendations**: Intelligent gift suggestions based on recipient, occasion, budget, and interests
- **Blog Publishing System**: Full-featured blog with Medium-style layout and AI content generation
- **Admin Dashboard**: Complete content management system with analytics
- **Security-First**: JWT authentication, rate limiting, input validation, and CSP
- **Enterprise Ready**: Comprehensive testing, CI/CD, monitoring, and compliance

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite 7
- **Styling**: Tailwind CSS 3 + @tailwindcss/typography
- **Backend**: Vercel Serverless Functions
- **Database**: Vercel Postgres
- **AI**: OpenAI GPT Integration
- **Testing**: Vitest + Playwright + Testing Library
- **Deployment**: Vercel
- **Security**: JWT + bcryptjs + Zod validation

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Vercel account
- OpenAI API key
- Vercel Postgres database

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-GFT
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   VITE_GA_TRACKING_ID=your-ga-tracking-id
   VITE_OPENAI_API_KEY=your-openai-api-key
   POSTGRES_URL=your-vercel-postgres-url
   JWT_SECRET=your-jwt-secret
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🧪 Testing

This project includes comprehensive testing across multiple levels:

### Unit Tests
```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests
```bash
# Install Playwright browsers
npm run test:e2e:install

# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed
```

### All Tests
```bash
# Run all tests (unit, integration, E2E)
npm run test:all
```

### Test Coverage
- **Unit Tests**: 80%+ coverage required
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user workflows
- **Security Tests**: Vulnerability scanning and security checks

## 🏗️ Project Structure

```
AI-GFT/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── ui/             # Base UI components
│   │   ├── gift-finder/    # Gift recommendation components
│   │   ├── blog/           # Blog-related components
│   │   └── layout/         # Layout components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── api/                    # Vercel serverless functions
│   ├── auth/               # Authentication endpoints
│   ├── blog/               # Blog API endpoints
│   └── generate-gifts.ts   # Gift generation API
├── lib/                    # Shared libraries
│   ├── auth.ts             # Authentication utilities
│   ├── validation/         # Zod schemas
│   └── rate-limit.ts       # Rate limiting
├── middleware/             # API middleware
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   └── e2e/                # End-to-end tests
├── database/               # Database schema and migrations
└── docs/                   # Documentation
```

## 🔧 Development

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run type-check
```

### Database Management
```bash
# Set up database users
npm run db:setup-users

# Run migrations
npm run db:migrate

# Reset database
npm run db:reset
```

### Security
```bash
# Run security audit
npm run test:security

# Check for vulnerabilities
npm audit
```

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Variables
Set these in your Vercel project:
- `VITE_GA_TRACKING_ID`
- `VITE_OPENAI_API_KEY`
- `POSTGRES_URL`
- `JWT_SECRET`

### Database Setup
1. Create a Vercel Postgres database
2. Run the setup script: `npm run db:setup`
3. Configure database users and permissions

## 📊 Monitoring & Analytics

- **Google Analytics 4**: User behavior tracking
- **Vercel Analytics**: Performance monitoring
- **Error Tracking**: Comprehensive error logging
- **Security Monitoring**: CSP violation reporting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation
- **Content Security Policy**: XSS protection
- **Password Hashing**: bcryptjs for secure password storage
- **Audit Logging**: Database change tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Use conventional commits
- Follow the established code style
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the test files for usage examples

## 🗺️ Roadmap

### Phase 1: Security Foundations ✅
- [x] JWT Authentication
- [x] Input Validation
- [x] Rate Limiting
- [x] Content Security Policy

### Phase 2: Database & Infrastructure ✅
- [x] Database Security
- [x] Automated Backups
- [x] Infrastructure as Code

### Phase 3: Testing & CI/CD ✅
- [x] Unit Tests
- [x] Integration Tests
- [x] E2E Tests
- [x] GitHub Actions CI/CD

### Phase 4: Performance Optimization (Next)
- [ ] Edge Caching
- [ ] AI Response Streaming
- [ ] Optimistic UI Updates

### Phase 5: Compliance & SEO (Planned)
- [ ] Privacy Compliance
- [ ] SEO Implementation

### Phase 6: Monitoring & Observability (Planned)
- [ ] Structured Logging
- [ ] Error Monitoring
