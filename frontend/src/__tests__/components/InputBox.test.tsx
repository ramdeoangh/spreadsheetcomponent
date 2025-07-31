import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InputBox from '../../components/InputBox';

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    sendMessage: vi.fn(),
  },
}));

describe('InputBox', () => {
  const mockOnMessageSent = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders input box with header and examples', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    expect(screen.getByText('User Input')).toBeInTheDocument();
    expect(screen.getByText('Examples:')).toBeInTheDocument();
    expect(screen.getByText('A1 Hello World')).toBeInTheDocument();
    expect(screen.getByText('B5 = 42')).toBeInTheDocument();
    expect(screen.getByText('C3 Test Message')).toBeInTheDocument();
  });

  it('renders input field and send button', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    expect(screen.getByPlaceholderText(/Enter command/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
  });

  it('updates input value when typing', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    fireEvent.change(input, { target: { value: 'A1 Test Message' } });
    
    expect(input).toHaveValue('A1 Test Message');
  });

  it('disables send button when input is empty', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const sendButton = screen.getByRole('button', { name: /Send/i });
    expect(sendButton).toBeDisabled();
  });

  it('enables send button when input has value', () => {
    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    
    fireEvent.change(input, { target: { value: 'A1 Test' } });
    expect(sendButton).not.toBeDisabled();
  });

  it('shows loading state when sending message', async () => {
    const { apiService } = await import('../../services/api');
    (apiService.sendMessage as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    
    fireEvent.change(input, { target: { value: 'A1 Test' } });
    fireEvent.click(sendButton);
    
    expect(sendButton).toHaveTextContent('Sending...');
    expect(sendButton).toBeDisabled();
  });

  it('calls onMessageSent when message is sent successfully', async () => {
    const { apiService } = await import('../../services/api');
    (apiService.sendMessage as any).mockResolvedValue({
      id: '123',
      message: 'A1 Test',
      timestamp: new Date(),
    });

    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    
    fireEvent.change(input, { target: { value: 'A1 Test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1 Test');
    });
  });

  it('calls onError when message sending fails', async () => {
    const { apiService } = await import('../../services/api');
    (apiService.sendMessage as any).mockRejectedValue(new Error('Network error'));

    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    const sendButton = screen.getByRole('button', { name: /Send/i });
    
    fireEvent.change(input, { target: { value: 'A1 Test' } });
    fireEvent.click(sendButton);
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Network error');
    });
  });

  it('submits form when Enter key is pressed', async () => {
    const { apiService } = await import('../../services/api');
    (apiService.sendMessage as any).mockResolvedValue({
      id: '123',
      message: 'A1 Test',
      timestamp: new Date(),
    });

    render(<InputBox onMessageSent={mockOnMessageSent} onError={mockOnError} />);
    
    const input = screen.getByPlaceholderText(/Enter command/);
    const form = input.closest('form');
    
    fireEvent.change(input, { target: { value: 'A1 Test' } });
    fireEvent.submit(form!);
    
    await waitFor(() => {
      expect(mockOnMessageSent).toHaveBeenCalledWith('A1 Test');
    });
  });
}); 