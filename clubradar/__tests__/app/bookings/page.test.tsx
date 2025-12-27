import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useUser } from "@clerk/nextjs";
import BookingsPage from "@/app/bookings/page";
import { mockClerkUser } from "../../utils/test-utils";

// Mock dependencies
jest.mock("@clerk/nextjs", () => ({
  useUser: jest.fn(),
  useClerk: jest.fn(() => ({
    signOut: jest.fn(),
  })),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock fetch
global.fetch = jest.fn();

describe("BookingsPage", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (useUser as jest.Mock).mockReturnValue({
      user: mockClerkUser,
      isLoaded: true,
    });

    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
      push: mockPush,
      refresh: jest.fn(),
    });
  });

  it("redirects to login if user is not authenticated", async () => {
    (useUser as jest.Mock).mockReturnValue({
      user: null,
      isLoaded: true,
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login?redirect=/bookings");
    });
  });

  it("shows loading state while fetching bookings", () => {
    (global.fetch as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<BookingsPage />);

    expect(screen.getByText(/loading your bookings/i)).toBeInTheDocument();
    expect(
      screen.getByRole("generic", { name: /loader/i })
    ).toBeInTheDocument();
  });

  it("displays bookings when loaded successfully", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("Test Venue")).toBeInTheDocument();
    });
  });

  it("displays empty state when no bookings exist", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: [] }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no bookings yet/i)).toBeInTheDocument();
      expect(screen.getByText(/start exploring events/i)).toBeInTheDocument();
    });
  });

  it("shows discover events button in empty state", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: [] }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const discoverButton = screen.getByRole("button", {
        name: /discover events/i,
      });
      expect(discoverButton).toBeInTheDocument();
    });

    const discoverButton = screen.getByRole("button", {
      name: /discover events/i,
    });
    await userEvent.click(discoverButton);

    expect(mockPush).toHaveBeenCalledWith("/discover");
  });

  it("displays booking details correctly", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("Test Venue")).toBeInTheDocument();
      expect(screen.getByText("20:00")).toBeInTheDocument();
      expect(screen.getByText(/electronic/i)).toBeInTheDocument();
      expect(screen.getByText("booking-1")).toBeInTheDocument();
    });
  });

  it("displays QR code when available", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const qrImage = screen.getByAltText("Booking QR Code");
      expect(qrImage).toBeInTheDocument();
      expect(qrImage).toHaveAttribute("src", "https://example.com/qr.png");
    });
  });

  it("displays booking status badge correctly", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "booking-2",
        events: {
          name: "Pending Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 500,
        number_of_people: 1,
        payment_status: "pending",
        qr_code: "",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Confirmed")).toBeInTheDocument();
      expect(screen.getByText("pending")).toBeInTheDocument();
    });
  });

  it("displays number of people correctly", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 1,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "booking-2",
        events: {
          name: "Test Event 2",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 2000,
        number_of_people: 3,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/1 person/i)).toBeInTheDocument();
      expect(screen.getByText(/3 people/i)).toBeInTheDocument();
    });
  });

  it("displays location information", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/123 test st/i)).toBeInTheDocument();
      expect(screen.getByText(/mumbai/i)).toBeInTheDocument();
    });
  });

  it("displays price correctly", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1500,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("1500")).toBeInTheDocument();
    });
  });

  it("shows past event indicator for past events", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    const pastDateString = pastDate.toISOString().split("T")[0];

    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Past Event",
          date: pastDateString,
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Test Venue",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr.png",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/this event has passed/i)).toBeInTheDocument();
    });
  });

  it("handles connection error and shows error message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Database connection failed",
        details: "Unable to connect to Supabase",
        hint: "Check your connection",
      }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });
  });

  it("handles table not found error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Bookings table not found",
        details: "The bookings table doesn't exist",
        hint: "Run the SQL script",
      }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/bookings table not found/i)).toBeInTheDocument();
    });
  });

  it("shows retry button on error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Database connection failed",
        details: "Unable to connect to Supabase",
      }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const retryButton = screen.getByRole("button", { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });
  });

  it("handles retry button click", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          error: "Database connection failed",
          details: "Unable to connect to Supabase",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({ bookings: [] }),
      });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });

    const retryButton = screen.getByRole("button", { name: /retry/i });
    await userEvent.click(retryButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it("shows check connection button on error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({
        error: "Database connection failed",
        details: "Unable to connect to Supabase",
      }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const checkButton = screen.getByRole("button", {
        name: /check connection/i,
      });
      expect(checkButton).toBeInTheDocument();
    });
  });

  it("handles check connection button click", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          error: "Database connection failed",
          details: "Unable to connect to Supabase",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => "application/json",
        },
        json: async () => ({
          supabase: {
            connection: {
              status: "connected",
            },
          },
        }),
      });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(
        screen.getByText(/database connection failed/i)
      ).toBeInTheDocument();
    });

    const checkButton = screen.getByRole("button", {
      name: /check connection/i,
    });
    await userEvent.click(checkButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/health");
    });
  });

  it("handles non-JSON response error", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: {
        get: () => "text/html",
      },
      text: async () => "<html>Error page</html>",
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const toast = require("react-hot-toast").default;
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it("displays back to discover link", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: [] }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /back to discover/i });
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute("href", "/discover");
    });
  });

  it("displays page header correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: [] }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText(/my bookings/i)).toBeInTheDocument();
      expect(
        screen.getByText(/view all your event bookings/i)
      ).toBeInTheDocument();
    });
  });

  it("handles multiple bookings display", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Event 1",
          date: "2024-12-31",
          time: "20:00",
          genre: "Electronic",
          venues: {
            name: "Venue 1",
            address: "123 Test St",
            city: "Mumbai",
          },
        },
        total_amount: 1000,
        number_of_people: 2,
        payment_status: "completed",
        qr_code: "https://example.com/qr1.png",
        created_at: "2024-01-01T00:00:00Z",
      },
      {
        id: "booking-2",
        events: {
          name: "Event 2",
          date: "2025-01-15",
          time: "21:00",
          genre: "Rock",
          venues: {
            name: "Venue 2",
            address: "456 Test Ave",
            city: "Delhi",
          },
        },
        total_amount: 2000,
        number_of_people: 4,
        payment_status: "pending",
        qr_code: "",
        created_at: "2024-01-02T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Event 1")).toBeInTheDocument();
      expect(screen.getByText("Event 2")).toBeInTheDocument();
      expect(screen.getByText("Venue 1")).toBeInTheDocument();
      expect(screen.getByText("Venue 2")).toBeInTheDocument();
    });
  });

  it("handles missing optional fields gracefully", async () => {
    const mockBookings = [
      {
        id: "booking-1",
        events: {
          name: "Test Event",
          date: "2024-12-31",
          time: "",
          genre: "",
          venues: {
            name: "Test Venue",
            address: "",
            city: "",
          },
        },
        total_amount: 0,
        number_of_people: 1,
        payment_status: "pending",
        qr_code: "",
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ bookings: mockBookings }),
    });

    render(<BookingsPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Event")).toBeInTheDocument();
      expect(screen.getByText("Test Venue")).toBeInTheDocument();
    });
  });
});
