import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUser, useClerk } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';
import { mockClerkUser } from '../utils/test-utils';

// Mock Clerk hooks
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(),
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockSignOut = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders logo and brand name', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    expect(screen.getByText('ClubRadar')).toBeInTheDocument();
    expect(screen.getByAltText('ClubRadar Logo')).toBeInTheDocument();
  });

  it('renders navigation menu for desktop', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    expect(screen.getByText('For Users')).toBeInTheDocument();
    expect(screen.getByText('For Venues')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('shows login and signup buttons when user is not authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument();
  });

  it('shows user menu when user is authenticated', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const user = userEvent.setup();
    (useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut.mockResolvedValue(undefined),
    });

    render(<Navbar />);
    
    // Open mobile menu first (for mobile logout button)
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it('shows loading state correctly', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: false,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    // Should not show auth buttons while loading
    expect(screen.queryByRole('link', { name: /login/i })).not.toBeInTheDocument();
  });

  it('renders mobile menu button', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('opens and closes mobile menu', async () => {
    const user = userEvent.setup();
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });

    render(<Navbar />);
    
    const menuButton = screen.getByRole('button', { name: /menu/i });
    await user.click(menuButton);
    
    expect(screen.getByText('Menu')).toBeInTheDocument();
    expect(screen.getByText('Discover Clubs')).toBeInTheDocument();
  });
});

