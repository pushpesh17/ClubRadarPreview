import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/footer';

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Footer Component', () => {
  it('renders footer with brand name', () => {
    render(<Footer />);
    expect(screen.getByText('ClubRadar')).toBeInTheDocument();
  });

  it('renders brand description', () => {
    render(<Footer />);
    expect(
      screen.getByText(/Your gateway to the best nightlife experiences/i)
    ).toBeInTheDocument();
  });

  it('renders social media links', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders "For Users" section with links', () => {
    render(<Footer />);
    expect(screen.getByText('For Users')).toBeInTheDocument();
    expect(screen.getByText('Discover Clubs')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
    expect(screen.getByText('Download App')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('renders "For Venues" section with links', () => {
    render(<Footer />);
    expect(screen.getByText('For Venues')).toBeInTheDocument();
    expect(screen.getByText('Register Your Venue')).toBeInTheDocument();
    expect(screen.getByText('Venue Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('renders "Support" section with links', () => {
    render(<Footer />);
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('displays current year in copyright', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} ClubRadar`))).toBeInTheDocument();
  });

  it('has correct href attributes for links', () => {
    render(<Footer />);
    const discoverLink = screen.getByText('Discover Clubs').closest('a');
    expect(discoverLink).toHaveAttribute('href', '/#discover');
    
    const contactLink = screen.getByText('Contact Us').closest('a');
    expect(contactLink).toHaveAttribute('href', '/contact');
  });
});

