# WCAG AI Platform v5

> **Enterprise Accessibility Compliance Platform with Multi-Agent AI**

A production-grade platform for automated WCAG 2.2 compliance auditing, AI-powered analysis, and FDCPA-compliant document generation.

## 🚀 Features

### Multi-Agent AI System
- **Coordinator Agent**: LangGraph-based workflow orchestration
- **WCAG Auditor Agent**: Axe-core 4.8 + Pa11y integration covering 87 WCAG criteria
- **Content Analyzer Agent**: Dual AI (OpenAI GPT-4o + Claude 3.5 Sonnet) analysis
- **Template Generator Agent**: FDCPA-compliant debt collection documents
- **Report Synthesizer Agent**: Comprehensive PDF/HTML/JSON/CSV reports

### Technology Stack
- **Frontend**: Next.js 15, React 19 Server Components, TypeScript 5.3
- **Styling**: Tailwind CSS 4.0, shadcn/ui components
- **API**: tRPC for end-to-end type safety
- **Database**: PostgreSQL with Prisma ORM
- **Queue**: BullMQ + Redis for job processing
- **AI**: LangChain + LangGraph with OpenAI and Anthropic
- **Testing**: Vitest, Playwright, E2E
- **Monitoring**: Sentry, DataDog (configurable)

### Enterprise Features
- ✅ Role-Based Access Control (RBAC)
- ✅ Multi-Factor Authentication (MFA)
- ✅ OAuth 2.0 Integration
- ✅ AES-256-GCM Encryption
- ✅ SOC 2 Compliance Audit Logging
- ✅ Rate Limiting (per tenant/user)
- ✅ API Key Management
- ✅ Multi-tenant Support

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- OpenAI API Key (for GPT-4)
- Anthropic API Key (for Claude, optional)

## 🛠️ Installation

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/wcagai-v5.git
cd wcagai-v5
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`: Redis configuration
- `OPENAI_API_KEY`: OpenAI API key
- `NEXTAUTH_SECRET`: Authentication secret
- `ENCRYPTION_KEY`: 32+ character encryption key

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed
```

### 4. Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
wcagai-v5/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── agents/                # 5 specialized AI agents
│   │   ├── coordinator.ts
│   │   ├── wcag-auditor.ts
│   │   ├── content-analyzer.ts
│   │   ├── template-generator.ts
│   │   └── report-synthesizer.ts
│   ├── components/            # React components (shadcn/ui)
│   ├── lib/                   # Utility libraries
│   │   ├── db.ts             # Prisma client
│   │   ├── queue.ts          # BullMQ job queues
│   │   ├── security.ts       # Encryption & security
│   │   ├── audit.ts          # SOC 2 audit logging
│   │   └── config.ts         # Configuration management
│   ├── server/                # tRPC server
│   │   ├── trpc.ts           # tRPC setup
│   │   ├── root.ts           # Root router
│   │   └── routers/          # API routers
│   │       ├── scan.ts
│   │       ├── report.ts
│   │       ├── template.ts
│   │       └── user.ts
│   ├── types/                 # TypeScript definitions
│   │   └── agents.ts
│   └── app/                   # Next.js app directory
├── tests/                     # Test suites
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 📡 API Usage

### tRPC Client Example

```typescript
import { trpc } from '@/lib/trpc';

// Submit a WCAG scan
const { scanId } = await trpc.scan.create.mutate({
  url: 'https://example.com',
  level: 'AA',
  runPa11y: true,
  screenshot: true,
});

// Check scan status
const scan = await trpc.scan.getStatus.query({ scanId });

// Generate report
const { jobId } = await trpc.report.generate.mutate({
  scanId,
  format: 'pdf',
});
```

### Multi-Agent Workflow

```typescript
import { coordinatorAgent } from '@/agents/coordinator';

// Execute complete audit workflow
const result = await coordinatorAgent.executeWorkflow(
  'https://example.com',
  { userId: 'user_123' }
);

console.log(result.violations);    // WCAG violations
console.log(result.analysis);      // AI analysis
console.log(result.report);        // Final report
```

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Requirements
- Vercel: Next.js app
- Supabase: PostgreSQL database
- Redis Cloud: Redis instance
- OpenAI: API access
- Anthropic: API access (optional)

## 📊 Monitoring

### Sentry (Error Tracking)
Set `SENTRY_DSN` in environment variables

### DataDog (Performance Monitoring)
Set `DATADOG_API_KEY` in environment variables

### Audit Logs
SOC 2 compliant audit logs stored in database:
```typescript
import { queryAuditLogs } from '@/lib/audit';

const logs = await queryAuditLogs({
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
});
```

## 🔐 Security

- **Encryption**: AES-256-GCM for sensitive data
- **Password Hashing**: bcrypt with 12 rounds
- **MFA**: TOTP-based two-factor authentication
- **Rate Limiting**: 100 requests per 15 minutes (configurable)
- **Input Sanitization**: XSS prevention
- **URL Validation**: Blocks private IPs in production
- **Audit Logging**: All actions logged for compliance

## 📝 FDCPA Compliance

The Template Generator Agent includes three pre-configured FDCPA-compliant templates:

1. **Initial Collection Notice** (§ 809)
2. **Debt Validation Notice** (§ 809(b))
3. **Settlement Offer Letter** (§ 807)

All templates include:
- Required disclosures
- 30-day validation notices
- Consumer rights information
- Compliance validation

## 🤝 Contributing

This is a production platform. Contributions welcome:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

## 🆘 Support

- Documentation: [docs.wcagai.com](https://docs.wcagai.com)
- Issues: [GitHub Issues](https://github.com/yourusername/wcagai-v5/issues)
- Email: support@wcagai.com

---

**Built with ❤️ for digital accessibility and legal compliance**
