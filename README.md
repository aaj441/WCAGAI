# WCAG AI Platform

A monorepo for WCAG compliance intelligence and accessibility scanning.

## Project Structure

```
wcag-ai-platform/
├── apps/
│   ├── scanner/          # WCAG accessibility scanner application
│   │   └── src/
│   │       └── scripts/
│   │           └── validate.ts
│   └── dashboard/        # Web dashboard for compliance reporting
│
├── packages/
│   ├── core/            # Core engine components
│   │   └── ConfidenceScoringEngine.ts
│   ├── db/              # Database and Prisma schema
│   │   └── prisma/
│   │       └── schema.prisma
│   ├── utils/           # Shared utilities
│   └── legacy-code/     # Original repository code (preserved)
│
├── output/              # Validation and scan output directory
├── package.json         # Root package configuration
└── tsconfig.json        # TypeScript configuration
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
npm install
```

### Available Scripts

- `npm run dev` - Run the validation script
- `npm run build` - Build TypeScript files
- `npm run clean` - Remove dist and node_modules
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push database schema
- `npm run db:migrate` - Run database migrations

### Running Validation

```bash
npm run dev
```

This will execute the scanner validation script and verify the setup.

## Dependencies

### Production
- `@prisma/client` - Database ORM
- `bullmq` - Queue management
- `puppeteer` - Browser automation
- `@axe-core/puppeteer` - Accessibility testing
- `pdf-lib` - PDF generation
- `openai` - AI integration
- `dotenv` - Environment configuration

### Development
- `prisma` - Database toolkit
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `tsx` - TypeScript execution

## Legacy Code

The original repository code has been preserved in `packages/legacy-code/` for reference and gradual migration.

## License

MIT
