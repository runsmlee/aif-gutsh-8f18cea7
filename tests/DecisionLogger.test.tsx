import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DecisionLogger from '../src/components/DecisionLogger';
import { useDecisions } from '../src/hooks/useDecisions';

// Mock the useDecisions hook
vi.mock('../src/hooks/useDecisions');

const mockAddCommit = vi.fn();
const mockUseDecisions = {
  decisions: [],
  addCommit: mockAddCommit,
  resolveCommit: vi.fn(),
  getAccuracy: vi.fn(() => ({ percentage: 0, correct: 0, incorrect: 0, partial: 0, total: 0 })),
};

beforeEach(() => {
  vi.mocked(useDecisions).mockReturnValue(mockUseDecisions);
  mockAddCommit.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DecisionLogger', () => {
  it('renders without crash', () => {
    render(<DecisionLogger />);
    expect(screen.getByPlaceholderText(/decision/i)).toBeInTheDocument();
  });

  it('input field is auto-focused on mount', () => {
    render(<DecisionLogger />);
    const decisionInput = screen.getByPlaceholderText(/decision/i);
    expect(decisionInput).toHaveFocus();
  });

  it('typing into decision field updates the input value', async () => {
    const user = userEvent.setup();
    render(<DecisionLogger />);
    const decisionInput = screen.getByPlaceholderText(/decision/i);
    await user.type(decisionInput, 'Pivot to enterprise');
    expect(decisionInput).toHaveValue('Pivot to enterprise');
  });

  it('typing into prediction field updates the input value', async () => {
    const user = userEvent.setup();
    render(<DecisionLogger />);
    const predictionInput = screen.getByPlaceholderText(/predict/i);
    await user.type(predictionInput, 'ARR doubles in 6 months');
    expect(predictionInput).toHaveValue('ARR doubles in 6 months');
  });

  it('moving confidence slider updates the displayed value', async () => {
    render(<DecisionLogger />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '8' } });
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });

  it('pressing Enter with all fields filled saves the commit', async () => {
    const user = userEvent.setup();
    mockAddCommit.mockReturnValue({ hash: 'a3f1', decision: 'Test', prediction: 'Pred', confidence: 5, timestamp: Date.now(), status: 'unresolved' });
    render(<DecisionLogger />);

    const decisionInput = screen.getByPlaceholderText(/decision/i);
    const predictionInput = screen.getByPlaceholderText(/predict/i);

    await user.type(decisionInput, 'Pivot to enterprise');
    await user.type(predictionInput, 'ARR doubles');
    await user.keyboard('{Enter}');

    expect(mockAddCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'Pivot to enterprise',
        prediction: 'ARR doubles',
      }),
    );
  });

  it('pressing Enter with empty decision text shows validation message', async () => {
    const user = userEvent.setup();
    render(<DecisionLogger />);

    const predictionInput = screen.getByPlaceholderText(/predict/i);
    await user.type(predictionInput, 'Some prediction');
    await user.keyboard('{Enter}');

    expect(screen.getByText(/decision.*required/i)).toBeInTheDocument();
    expect(mockAddCommit).not.toHaveBeenCalled();
  });

  it('pressing Enter with empty prediction text shows validation message', async () => {
    const user = userEvent.setup();
    render(<DecisionLogger />);

    const decisionInput = screen.getByPlaceholderText(/decision/i);
    await user.type(decisionInput, 'Some decision');
    await user.keyboard('{Enter}');

    expect(screen.getByText(/prediction.*required/i)).toBeInTheDocument();
    expect(mockAddCommit).not.toHaveBeenCalled();
  });

  it('after saving, input fields are cleared and ready for next commit', async () => {
    const user = userEvent.setup();
    mockAddCommit.mockReturnValue({ hash: 'a3f1', decision: 'Test', prediction: 'Pred', confidence: 5, timestamp: Date.now(), status: 'unresolved' });
    render(<DecisionLogger />);

    const decisionInput = screen.getByPlaceholderText(/decision/i);
    const predictionInput = screen.getByPlaceholderText(/predict/i);

    await user.type(decisionInput, 'Pivot to enterprise');
    await user.type(predictionInput, 'ARR doubles');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(decisionInput).toHaveValue('');
      expect(predictionInput).toHaveValue('');
    });
  });

  it('Cmd/Ctrl+G keyboard shortcut focuses the input field', async () => {
    render(<DecisionLogger />);
    const decisionInput = screen.getByPlaceholderText(/decision/i);

    // Blur the input first
    act(() => { decisionInput.blur(); });
    expect(decisionInput).not.toHaveFocus();

    // Trigger Cmd+G / Ctrl+G
    fireEvent.keyDown(document, { key: 'g', metaKey: true }); // Cmd+G on Mac
    expect(decisionInput).toHaveFocus();
  });
});
