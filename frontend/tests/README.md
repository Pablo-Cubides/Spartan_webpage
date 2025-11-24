
# Test Suite

This directory contains integration tests for the Spartan Club application.

## Structure

- `payments/`: Tests for payment processing and credit allocation.
- `users/`: Tests for user management and signup bonuses.
- `asesor-estilo/`: Tests for the AI Style Advisor feature.
- `run-all.ts`: Main test runner script.

## Running Tests

You can run tests using the npm scripts defined in `package.json`:

```bash
# Run all tests
npm test

# Run specific suites
npm run test:payments
npm run test:users
npm run test:asesor-estilo
```

## Environment

Tests run against the local environment defined in `.env.local`.
Ensure you have a valid `.env.local` file before running tests.

## Adding New Tests

1. Create a new test file in the appropriate subdirectory (e.g., `tests/new-feature/feature.test.ts`).
2. Use the dynamic import pattern for application code to ensure environment variables are loaded correctly:

```typescript
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export async function runMyTest() {
  // Import app code dynamically
  const { myFunction } = await import('../../src/lib/my-feature');
  // ... test logic ...
}

// Allow running directly
import { fileURLToPath } from 'url';
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runMyTest();
}
```

3. Add the test to `tests/run-all.ts`.
