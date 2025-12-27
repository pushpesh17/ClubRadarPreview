import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ClerkProvider } from '@clerk/nextjs';

// Mock Clerk provider for tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock user data for testing
export const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  image: 'https://example.com/avatar.jpg',
  phone: '+1234567890',
};

export const mockClerkUser = {
  id: 'user_123',
  primaryEmailAddress: {
    emailAddress: 'test@example.com',
  },
  fullName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  primaryPhoneNumber: {
    phoneNumber: '+1234567890',
  },
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

