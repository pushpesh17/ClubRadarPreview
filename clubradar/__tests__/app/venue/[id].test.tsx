import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUser } from '@clerk/nextjs';
import VenueDetailPage from '@/app/venue/[id]/page';
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
  useParams: () => ({ id: 'venue-1' }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
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

describe('VenueDetailPage ([id])', () => {
  const mockPush = jest.fn();
  const mockVenue = {
    id: 'venue-1',
    name: 'Test Venue',
    description: 'A great venue',
    address: '123 Test St',
    city: 'Mumbai',
    pincode: '400001',
    phone: '+911234567890',
    email: 'test@venue.com',
    status: 'approved',
    images: ['https://example.com/image1.jpg'],
    amenities: ['wifi', 'parking', 'food'],
    rating: 4.5,
    booking_paused: false,
  };

  const mockEvents = [
    {
      id: 'event-1',
      name: 'Test Event',
      genre: 'Electronic',
      price: 500,
      time: '20:00',
      date: '2024-12-31',
      capacity: 100,
      booked: 50,
      description: 'Great event',
      images: [],
    },
  ];

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

  it('shows loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<VenueDetailPage />);
    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
  });

  it('displays venue information when loaded', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Venue')).toBeInTheDocument();
      expect(screen.getByText('A great venue')).toBeInTheDocument();
      expect(screen.getByText(/123 test st/i)).toBeInTheDocument();
    });
  });

  it('displays events list', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
      expect(screen.getByText(/electronic/i)).toBeInTheDocument();
    });
  });

  it('opens booking dialog when book button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    const bookButton = screen.getByRole('button', { name: /book now/i });
    await userEvent.click(bookButton);

    await waitFor(() => {
      expect(screen.getByText(/book event/i)).toBeInTheDocument();
    });
  });

  it('redirects to login when booking without authentication', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    const bookButton = screen.getByRole('button', { name: /login to book/i });
    await userEvent.click(bookButton);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login'));
    });
  });

  it('displays reviews section', async () => {
    const mockReviews = [
      {
        id: 'review-1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Great venue!',
        createdAt: '2024-01-01T00:00:00Z',
        helpfulCount: 10,
      },
    ];

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: mockReviews,
          pagination: { totalPages: 1 },
          viewer: { canReview: true, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Great venue!')).toBeInTheDocument();
    });
  });

  it('opens review dialog when write review button is clicked', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: true, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
    });

    const writeReviewButton = screen.getByRole('button', { name: /write review/i });
    await userEvent.click(writeReviewButton);

    await waitFor(() => {
      expect(screen.getByText(/write a review/i)).toBeInTheDocument();
    });
  });

  it('displays amenities section', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/amenities/i)).toBeInTheDocument();
      expect(screen.getByText(/wifi/i)).toBeInTheDocument();
      expect(screen.getByText(/parking/i)).toBeInTheDocument();
    });
  });

  it('shows error message when venue is not found', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Venue not found' }),
    });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/venue not found/i)).toBeInTheDocument();
    });
  });

  it('handles booking confirmation', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          booking: {
            id: 'booking-1',
            qr_code: 'https://example.com/qr.png',
          },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Event')).toBeInTheDocument();
    });

    const bookButton = screen.getByRole('button', { name: /book now/i });
    await userEvent.click(bookButton);

    await waitFor(() => {
      expect(screen.getByText(/book event/i)).toBeInTheDocument();
    });

    const confirmButton = screen.getByRole('button', { name: /confirm booking/i });
    await userEvent.click(confirmButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/bookings',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('displays image gallery when images are available', async () => {
    const venueWithImages = {
      ...mockVenue,
      images: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: venueWithImages,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: false, hasReviewed: false },
        }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/view all/i)).toBeInTheDocument();
    });
  });

  it('handles review submission', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: mockVenue,
          events: mockEvents,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          reviews: [],
          pagination: { totalPages: 1 },
          viewer: { canReview: true, hasReviewed: false },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      });

    render(<VenueDetailPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/reviews/i)).toBeInTheDocument();
    });

    const writeReviewButton = screen.getByRole('button', { name: /write review/i });
    await userEvent.click(writeReviewButton);

    await waitFor(() => {
      expect(screen.getByText(/write a review/i)).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/share your experience/i);
    await userEvent.type(textarea, 'Great venue experience!');

    const submitButton = screen.getByRole('button', { name: /submit review/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/venues/venue-1/reviews'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

