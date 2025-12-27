import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />);
    const input = screen.getByPlaceholderText('Enter text');
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe('INPUT');
  });

  it('handles text input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Enter text" />);
    
    const input = screen.getByPlaceholderText('Enter text') as HTMLInputElement;
    await user.type(input, 'Hello World');
    
    expect(input.value).toBe('Hello World');
  });

  it('supports different input types', () => {
    const { rerender } = render(<Input type="text" placeholder="Text input" />);
    let input = screen.getByPlaceholderText('Text input');
    expect(input).toHaveAttribute('type', 'text');

    rerender(<Input type="email" placeholder="Email input" />);
    input = screen.getByPlaceholderText('Email input');
    expect(input).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="Password input" />);
    input = screen.getByPlaceholderText('Password input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('applies custom className', () => {
    const { container } = render(<Input className="custom-class" />);
    const input = container.querySelector('[data-slot="input"]');
    expect(input).toHaveClass('custom-class');
  });

  it('handles disabled state', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText('Disabled input');
    expect(input).toBeDisabled();
  });

  it('handles required attribute', () => {
    render(<Input required placeholder="Required input" />);
    const input = screen.getByPlaceholderText('Required input');
    expect(input).toBeRequired();
  });

  it('handles value prop', () => {
    render(<Input value="Initial value" readOnly />);
    const input = screen.getByDisplayValue('Initial value') as HTMLInputElement;
    expect(input.value).toBe('Initial value');
  });

  it('calls onChange handler', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} placeholder="Test input" />);
    const input = screen.getByPlaceholderText('Test input');
    
    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
  });

  it('handles aria-invalid attribute', () => {
    const { container } = render(<Input aria-invalid="true" />);
    const input = container.querySelector('[data-slot="input"]');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});

