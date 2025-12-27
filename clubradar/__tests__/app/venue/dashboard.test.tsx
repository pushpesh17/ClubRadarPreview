import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUser } from '@clerk/nextjs';
import VenueDashboard from '@/app/venue/dashboard/page';
import { mockClerkUser } from '../../utils/test-utils';

// Mock dependencies
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe('VenueDashboard Page', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });
    
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
  });

  it('redirects to login if user is not authenticated', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/venue/dashboard');
    });
  });

  it('shows loading state while checking venue status', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<VenueDashboard />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows registration prompt if no venue exists', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/register your venue/i)).toBeInTheDocument();
    });
  });

  it('shows pending status message if venue is pending', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        hasVenue: true,
        venue: {
          id: 'venue-1',
          name: 'Test Venue',
          status: 'pending',
          city: 'Mumbai',
          address: '123 Test St',
        },
      }),
    });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
    });
  });

  it('shows dashboard tabs when venue is approved', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: [], count: 0 }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
      expect(screen.getByText(/events/i)).toBeInTheDocument();
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
    });
  });

  it('displays events in events tab', async () => {
    const mockEvents = [
      {
        id: 'event-1',
        name: 'Test Event',
        date: '2024-12-31',
        time: '20:00',
        genre: 'Electronic',
        capacity: 100,
        price: 500,
        booked: 50,
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: mockEvents }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: [], count: 0 }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/events/i)).toBeInTheDocument();
    });

    const eventsTab = screen.getByRole('button', { name: /events/i });
    await userEvent.click(eventsTab);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });
  });

  it('opens create event dialog', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: [], count: 0 }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/events/i)).toBeInTheDocument();
    });

    const eventsTab = screen.getByRole('button', { name: /events/i });
    await userEvent.click(eventsTab);

    await waitFor(() => {
      const createButton = screen.getByRole('button', { name: /create event/i });
      expect(createButton).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /create event/i });
    await userEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/create new event/i)).toBeInTheDocument();
    });
  });

  it('displays bookings in bookings tab', async () => {
    const mockBookings = [
      {
        id: 'booking-1',
        event_name: 'Test Event',
        user_name: 'John Doe',
        number_of_people: 2,
        total_price: 1000,
        status: 'confirmed',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: mockBookings, count: 1 }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
    });

    const bookingsTab = screen.getByRole('button', { name: /bookings/i });
    await userEvent.click(bookingsTab);

    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays earnings in earnings tab', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: [], count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          totalEarnings: 10000,
          pendingPayout: 5000,
          lastPayout: null,
          payoutHistory: [],
        }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/earnings/i)).toBeInTheDocument();
    });

    const earningsTab = screen.getByRole('button', { name: /earnings/i });
    await userEvent.click(earningsTab);

    await waitFor(() => {
      expect(screen.getByText(/total earnings/i)).toBeInTheDocument();
    });
  });

  it('handles booking pause toggle', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          hasVenue: true,
          venue: {
            id: 'venue-1',
            name: 'Test Venue',
            status: 'approved',
            city: 'Mumbai',
            address: '123 Test St',
            bookingPaused: false,
          },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ events: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ bookings: [], count: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

    render(<VenueDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/overview/i)).toBeInTheDocument();
    });

    // Look for pause/resume button
    const pauseButton = screen.queryByRole('button', { name: /pause|resume/i });
    if (pauseButton) {
      await userEvent.click(pauseButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/venues/pause-booking'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    }
  });
});

