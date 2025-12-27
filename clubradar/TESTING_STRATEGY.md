# Testing Strategy for ClubRadar

## Overview

This document outlines the comprehensive testing strategy for the ClubRadar application. We use a multi-layered testing approach combining unit tests, component tests, and end-to-end (E2E) tests.

## Testing Pyramid

```
        /\
       /  \
      / E2E \        ← Few, critical user flows
     /--------\
    /          \
   / Component  \    ← Many, component behavior
  /--------------\
 /                \
/   Unit Tests     \  ← Most, utility functions
/------------------\
```

## Testing Tools

### 1. Unit & Component Testing
- **Jest**: Test runner and assertion library
- **React Testing Library**: Component testing utilities
- **@testing-library/user-event**: User interaction simulation

### 2. End-to-End Testing
- **Playwright**: Browser automation and E2E testing

## Test Structure

```
clubradar/
├── __tests__/              # Unit and component tests
│   ├── components/         # Component tests
│   │   ├── ui/            # UI component tests
│   │   └── ...            # Feature component tests
│   └── utils/             # Test utilities
├── e2e/                    # E2E tests
│   ├── homepage.spec.ts
│   ├── navigation.spec.ts
│   └── auth-flow.spec.ts
├── jest.config.js          # Jest configuration
├── jest.setup.js           # Jest setup file
└── playwright.config.ts    # Playwright configuration
```

## Test Categories

### 1. Unit Tests
**Location**: `__tests__/components/ui/`

**Purpose**: Test individual UI components in isolation

**Examples**:
- Button component variants and interactions
- Input component validation
- Card component rendering

**Coverage Goal**: 80%+ for utility functions and simple components

### 2. Component Tests
**Location**: `__tests__/components/`

**Purpose**: Test complex components with their dependencies and interactions

**Examples**:
- Navbar with authentication states
- Footer with all links
- OccasionDecorations with different occasions

**What to Test**:
- Component renders correctly
- Props are handled properly
- User interactions work as expected
- Conditional rendering based on state
- Integration with hooks and context

### 3. Integration Tests
**Location**: `__tests__/integration/` (to be created)

**Purpose**: Test how multiple components work together

**Examples**:
- Booking flow components
- Venue dashboard components
- Profile page components

### 4. End-to-End Tests
**Location**: `e2e/`

**Purpose**: Test complete user flows in a real browser environment

**Critical Flows to Test**:
1. **Homepage Navigation**
   - Page loads correctly
   - Navigation links work
   - Footer is accessible

2. **Authentication Flow**
   - User can login
   - User can signup
   - User can logout
   - Protected routes redirect correctly

3. **Discovery Flow**
   - User can browse venues
   - User can filter/search venues
   - User can view venue details

4. **Booking Flow**
   - User can select event
   - User can complete booking
   - User receives confirmation

5. **Venue Dashboard Flow**
   - Venue can login
   - Venue can create events
   - Venue can view bookings
   - Venue can manage earnings

## Running Tests

### Unit & Component Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug
```

### Run All Tests
```bash
npm run test:all
```

## Test Writing Guidelines

### Component Tests

1. **Test Behavior, Not Implementation**
   ```tsx
   // ❌ Bad: Testing implementation details
   expect(component.state.isOpen).toBe(true);
   
   // ✅ Good: Testing user-visible behavior
   expect(screen.getByText('Menu')).toBeVisible();
   ```

2. **Use Accessible Queries**
   ```tsx
   // ✅ Good: Using accessible queries
   screen.getByRole('button', { name: /submit/i });
   screen.getByLabelText('Email');
   screen.getByText('Welcome');
   ```

3. **Test User Interactions**
   ```tsx
   const user = userEvent.setup();
   await user.click(button);
   await user.type(input, 'test@example.com');
   ```

4. **Mock External Dependencies**
   ```tsx
   // Mock Next.js router
   jest.mock('next/navigation', () => ({
     useRouter: () => ({ push: jest.fn() }),
   }));
   ```

### E2E Tests

1. **Test Critical User Flows**
   - Focus on paths that users take most often
   - Test happy paths and error scenarios

2. **Use Page Object Model (Optional)**
   - Create reusable page objects for complex pages
   - Keep tests readable and maintainable

3. **Test Across Browsers**
   - Run tests on Chrome, Firefox, and Safari
   - Test mobile viewports

4. **Use Fixtures for Authentication**
   ```tsx
   // Use Playwright's authentication state
   test.use({ storageState: 'auth.json' });
   ```

## Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Component Tests**: 70%+ coverage
- **E2E Tests**: All critical user flows

## Continuous Integration

Tests should run automatically:
- On every pull request
- Before merging to main branch
- On scheduled basis (nightly builds)

## Test Maintenance

1. **Keep Tests Updated**
   - Update tests when components change
   - Remove obsolete tests

2. **Fix Flaky Tests**
   - Investigate and fix unstable tests immediately
   - Use proper wait strategies in E2E tests

3. **Review Test Coverage**
   - Regularly review coverage reports
   - Add tests for uncovered critical paths

## Next Steps

### Phase 1: Foundation (Current)
- ✅ Set up Jest and React Testing Library
- ✅ Set up Playwright
- ✅ Create test utilities
- ✅ Add tests for core components (Button, Footer, Navbar, OccasionDecorations)

### Phase 2: Component Coverage
- [ ] Add tests for all UI components
- [ ] Add tests for complex components (Sidebar, Providers)
- [ ] Add tests for page components

### Phase 3: Integration Tests
- [ ] Test booking flow components
- [ ] Test venue dashboard components
- [ ] Test profile components

### Phase 4: E2E Coverage
- [ ] Complete authentication flow tests
- [ ] Add discovery flow tests
- [ ] Add booking flow tests
- [ ] Add venue dashboard flow tests

### Phase 5: Advanced Testing
- [ ] Performance testing
- [ ] Accessibility testing
- [ ] Visual regression testing (optional)

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

