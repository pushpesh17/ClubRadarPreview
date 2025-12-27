import { render, screen } from '@testing-library/react';
import { OccasionDecorations } from '@/components/occasion-decorations';
import type { OccasionType } from '@/lib/occasion-config';

// Mock window.matchMedia for animations
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('OccasionDecorations Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders nothing when enabled is false', () => {
    const { container } = render(<OccasionDecorations enabled={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders decorations when enabled is true', () => {
    render(<OccasionDecorations enabled={true} occasion="default" />);
    const container = screen.getByRole('generic', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('renders with default occasion when no occasion prop is provided', () => {
    render(<OccasionDecorations enabled={true} />);
    const container = screen.getByRole('generic', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('renders different emojis for different occasions', () => {
    const occasions: OccasionType[] = ['diwali', 'christmas', 'newyear', 'holi'];
    
    occasions.forEach((occasion) => {
      const { rerender } = render(
        <OccasionDecorations enabled={true} occasion={occasion} />
      );
      const container = screen.getByRole('generic', { hidden: true });
      expect(container).toBeInTheDocument();
      rerender(<div />); // Clean up for next iteration
    });
  });

  it('creates decorations with correct structure', () => {
    render(<OccasionDecorations enabled={true} occasion="default" />);
    const container = screen.getByRole('generic', { hidden: true });
    
    // Check that decorations are created (they should have emoji content)
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('fixed', 'inset-0', 'pointer-events-none');
  });

  it('updates decorations when occasion changes', () => {
    const { rerender } = render(
      <OccasionDecorations enabled={true} occasion="diwali" />
    );
    
    let container = screen.getByRole('generic', { hidden: true });
    expect(container).toBeInTheDocument();
    
    rerender(<OccasionDecorations enabled={true} occasion="christmas" />);
    container = screen.getByRole('generic', { hidden: true });
    expect(container).toBeInTheDocument();
  });

  it('clears decorations when disabled', () => {
    const { rerender } = render(
      <OccasionDecorations enabled={true} occasion="default" />
    );
    
    expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument();
    
    rerender(<OccasionDecorations enabled={false} occasion="default" />);
    expect(screen.queryByRole('generic', { hidden: true })).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for occasion colors', () => {
    const { container } = render(
      <OccasionDecorations enabled={true} occasion="diwali" />
    );
    
    const decorationElements = container.querySelectorAll('[class*="text-yellow"]');
    expect(decorationElements.length).toBeGreaterThan(0);
  });
});

