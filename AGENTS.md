# AGENTS.md

## Overview
This document outlines the standard operating procedures for agentic coding agents working in this repository.

---

## Build, Lint, Test Commands

### Root Level Scripts
```bash
# Start development server for all packages
pnpm dev

# Build all packages
pnpm build

# Start production servers for all packages
pnpm start
```

### Backend Package (`apps/backend`)
```bash
# Start development server with hot reload
npm run dev

# Clean build artifacts
npm run clean

# Build the backend
npm run build

# Start production server
npm run start

# Generate Prisma client
npm run db:generate

# Push Prisma schema to database
npm run db:push
```

### Frontend Package (`apps/frontend`)
```bash
# Start development server on port 3000
npm run dev

# Build frontend for production
npm run build

# Preview production build
npm run preview

# Run all tests
npm run test

# Run linting
npm run lint

# Check formatting
npm run format

# Fix formatting and linting issues
npm run check
```

### Resource Package (`packages/resource`)
```bash
# Run TypeScript type checking
npm run typecheck
```

---

## Code Style Guidelines

### TypeScript Configuration
Both frontend and backend use strict TypeScript mode:
- Frontend: `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `noFallthroughCasesInSwitch: true`, `noUncheckedSideEffectImports: true
- Backend: `strict: true`

### Formatting
Uses Prettier with the following configuration:
```js
{
  semi: false,
  singleQuote: true,
  trailingComma: "all"
}
```

### Linting
Uses `@tanstack/eslint-config with custom overrides:
- `import/no-cycle`: off
- `import/order`: off
- `sort-imports`: off
- `@typescript-eslint/array-type`: off
- `@typescript-eslint/require-await`: off
- `pnpm/json-enforce-catalog`: off

### Naming Conventions
- **Components: PascalCase
- **Variables/functions: camelCase
- **Constants: UPPER_SNAKE_CASE
- **Files: kebab-case for route files, PascalCase for component files

### Import Rules
- Use absolute imports with `@/` alias for frontend code
- Use workspace imports for shared packages like `@repo/resource`

### Error Handling
- Use Zod for runtime type and validation
- Follow the existing error handling patterns in the codebase

---

## Additional Rules

## Cursor Rules
No custom Cursor rules found in `.cursor/rules/ or `.cursorrules

## Copilot Rules
No custom Copilot rules found in `.github/copilot-instructions.md
