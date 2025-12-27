# Testing Guide

This guide will help you run and write tests for the ClubRadar application.

## Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Unit/Component Tests Only
```bash
npm run test
```

### Run E2E Tests Only
```bash
npm run test:e2e
```

## Test Commands

### Unit & Component Tests (Jest)

```bash
# Run all tests once
npm run test

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/homepage.spec.ts
```

## Test Structure

```
clubradar/
├── __tests__/                    # Unit & Component Tests
│   ├── components/
│   │   ├── ui/                  # UI component tests
│   │   │   ├── button.test.tsx
│   │   │   ├── card.test.tsx
│   │   │   └── input.test.tsx
│   │   ├── footer.test.tsx
│   │   ├── navbar.test.tsx
│   │   └── occasion-decorations.test.tsx
│   └── utils/
│       └── test-utils.tsx       # Test utilities
│
├── e2e/                          # E2E Tests
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   └── auth-flow.spec.ts
│
├── jest.config.js                # Jest configuration
├── jest.setup.js                 # Jest setup
└── playwright.config.ts          # Playwright configuration
```

## Writing Tests

### Component Test Example

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

```tsx
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('ClubRadar')).toBeVisible();
});
```

## Test Coverage

Current test coverage includes:

### ✅ Completed
- Button component
- Card component
- Input component
- Footer component
- Navbar component
- OccasionDecorations component
- Homepage E2E tests
- Navigation E2E tests
- Auth flow E2E tests (basic)

### 📝 To Be Added
- Remaining UI components (Avatar, Badge, Dialog, etc.)
- Sidebar component
- Providers components
- Page components
- Complete booking flow E2E tests
- Venue dashboard E2E tests

## Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and interact with
   - Avoid testing internal state or implementation details

2. **Use Accessible Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **Keep Tests Simple**
   - One assertion per test when possible
   - Test one thing at a time

4. **Mock External Dependencies**
   - Mock Next.js router, Clerk, and other external services
   - Use test utilities for common mocks

5. **Write Descriptive Test Names**
   - Use clear, descriptive test names
   - Follow the pattern: "should [expected behavior]"

## Troubleshooting

### Jest Tests Not Running
- Make sure all dependencies are installed: `npm install`
- Check that `jest.config.js` is in the root directory
- Verify `jest.setup.js` exists

### Playwright Tests Failing
- Ensure the dev server is running or Playwright will start it automatically
- Check that `playwright.config.ts` has the correct base URL
- Run `npx playwright install` to install browser binaries

### TypeScript Errors in Tests
- Ensure `@types/jest` is installed
- Check `tsconfig.json` includes test files

## CI/CD Integration

Tests should run automatically in CI/CD pipelines:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test

- name: Run E2E tests
  run: npm run test:e2e
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Strategy](./TESTING_STRATEGY.md)

