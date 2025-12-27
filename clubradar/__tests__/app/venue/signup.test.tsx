import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUser, useClerk } from '@clerk/nextjs';
import VenueSignup from '@/app/venue/signup/page';
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

describe('VenueSignup Page', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush, refresh: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });
    (useClerk as jest.Mock).mockReturnValue({
      signOut: jest.fn(),
    });
    
    // Mock router
    jest.spyOn(require('next/navigation'), 'useRouter').mockReturnValue(mockRouter);
  });

  it('renders venue signup page header', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByText(/register your venue/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while checking venue status', () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<VenueSignup />);
    expect(screen.getByText(/checking registration status/i)).toBeInTheDocument();
  });

  it('redirects to login if user is not authenticated', async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login?redirect=/venue/signup');
    });
  });

  it('shows pending status if venue already exists with pending status', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        hasVenue: true,
        venue: {
          status: 'pending',
          name: 'Test Venue',
          createdAt: '2024-01-01',
        },
      }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByText(/registration under review/i)).toBeInTheDocument();
    });
  });

  it('shows approved status if venue is approved', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        hasVenue: true,
        venue: {
          status: 'approved',
          name: 'Test Venue',
          createdAt: '2024-01-01',
        },
      }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByText(/registration successfully approved/i)).toBeInTheDocument();
    });
  });

  it('shows rejected status if venue is rejected', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        hasVenue: true,
        venue: {
          status: 'rejected',
          name: 'Test Venue',
          createdAt: '2024-01-01',
        },
      }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByText(/registration rejected/i)).toBeInTheDocument();
    });
  });

  it('renders step 1 form fields', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/venue type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/complete address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/pincode/i)).toBeInTheDocument();
    });
  });

  it('allows navigation to step 2', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    const venueNameInput = screen.getByLabelText(/venue name/i);
    await user.type(venueNameInput, 'Test Venue');

    const nextButton = screen.getByRole('button', { name: /next: contact details/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });
  });

  it('validates required fields in step 2', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    // Fill step 1
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.type(screen.getByLabelText(/complete address/i), '123 Test St');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.type(screen.getByLabelText(/pincode/i), '400001');

    await user.click(screen.getByRole('button', { name: /next: contact details/i }));

    // Try to proceed without filling step 2
    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });

    const nextToStep3 = screen.getByRole('button', { name: /next: kyc documents/i });
    await user.click(nextToStep3);

    // Should show error toast (mocked)
    await waitFor(() => {
      const toast = require('react-hot-toast').default;
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('renders document upload sections in step 3', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    // Navigate to step 3
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.type(screen.getByLabelText(/complete address/i), '123 Test St');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.type(screen.getByLabelText(/pincode/i), '400001');
    await user.click(screen.getByRole('button', { name: /next: contact details/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/owner\/manager name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '+911234567890');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /next: kyc documents/i }));

    await waitFor(() => {
      expect(screen.getByText(/pan & gst registration documents/i)).toBeInTheDocument();
      expect(screen.getByText(/fssai license/i)).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ hasVenue: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          files: [{ name: 'test.pdf', url: 'https://example.com/test.pdf' }],
          message: 'Upload successful',
        }),
      });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    // Navigate to step 3
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.type(screen.getByLabelText(/complete address/i), '123 Test St');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.type(screen.getByLabelText(/pincode/i), '400001');
    await user.click(screen.getByRole('button', { name: /next: contact details/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/owner\/manager name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '+911234567890');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /next: kyc documents/i }));

    await waitFor(() => {
      const uploadButton = screen.getByText(/upload pan & gst documents/i);
      expect(uploadButton).toBeInTheDocument();
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      await user.upload(fileInput, file);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/venues/upload-documents',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    }
  });

  it('validates form submission with missing required fields', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ hasVenue: false }),
    });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    // Navigate to step 3
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.type(screen.getByLabelText(/complete address/i), '123 Test St');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.type(screen.getByLabelText(/pincode/i), '400001');
    await user.click(screen.getByRole('button', { name: /next: contact details/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/owner\/manager name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '+911234567890');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /next: kyc documents/i }));

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit registration/i });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit registration/i });
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      const toast = require('react-hot-toast').default;
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('handles successful venue registration', async () => {
    const user = userEvent.setup();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ hasVenue: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          venue: { message: 'Registration submitted successfully!' },
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({}),
      });

    render(<VenueSignup />);
    
    await waitFor(() => {
      expect(screen.getByLabelText(/venue name/i)).toBeInTheDocument();
    });

    // Fill all required fields
    await user.type(screen.getByLabelText(/venue name/i), 'Test Venue');
    await user.type(screen.getByLabelText(/complete address/i), '123 Test St');
    await user.type(screen.getByLabelText(/city/i), 'Mumbai');
    await user.type(screen.getByLabelText(/pincode/i), '400001');
    await user.click(screen.getByRole('button', { name: /next: contact details/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/owner\/manager name/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/owner\/manager name/i), 'John Doe');
    await user.type(screen.getByLabelText(/phone number/i), '+911234567890');
    await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /next: kyc documents/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/license number/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/license number/i), 'LIC123456');
    await user.type(screen.getByLabelText(/pan number/i), 'ABCDE1234F');
    await user.type(screen.getByLabelText(/bank account number/i), '1234567890');
    await user.type(screen.getByLabelText(/ifsc code/i), 'HDFC0001234');

    // Mock document uploads
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        files: [{ name: 'pan.pdf', url: 'https://example.com/pan.pdf' }],
      }),
    });

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      const file = new File(['test'], 'pan.pdf', { type: 'application/pdf' });
      await user.upload(fileInput, file);
    }

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /submit registration/i });
      expect(submitButton).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /submit registration/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/venues/register',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });
});

