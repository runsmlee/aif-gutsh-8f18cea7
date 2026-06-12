import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DecisionCard from '../src/components/DecisionCard';
import type { Decision } from '../src/types';

const mockResolve = vi.fn();

const baseDecision: Decision = {
  hash: 'a3f1',
  decision: 'Pivot to enterprise',
  prediction: 'ARR doubles in 6 months',
  confidence: 8,
  timestamp: new Date('2024-01-15T10:30:00Z').getTime(),
  status: 'unresolved',
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('DecisionCard', () => {
  it('renders without crash', () => {
    render(<DecisionCard decision={baseDecision} onResolve={mockResolve} />);
    expect(screen.getByText('Pivot to enterprise')).toBeInTheDocument();
  });

  it('displays decision text, prediction text, confidence level, hash, and timestamp', () => {
    render(<DecisionCard decision={baseDecision} onResolve={mockResolve} />);
    expect(screen.getByText('Pivot to enterprise')).toBeInTheDocument();
    expect(screen.getByText(/ARR doubles in 6 months/)).toBeInTheDocument();
    expect(screen.getByText(/8/)).toBeInTheDocument();
    expect(screen.getByText(/a3f1/)).toBeInTheDocument();
    // Timestamp should be displayed
    expect(screen.getByText(/Jan/)).toBeInTheDocument();
  });

  it('shows "Unresolved" badge when not yet resolved', () => {
    render(<DecisionCard decision={baseDecision} onResolve={mockResolve} />);
    expect(screen.getByText(/unresolved/i)).toBeInTheDocument();
  });

  it('clicking resolve button reveals correct/incorrect/partial buttons', async () => {
    const user = userEvent.setup();
    render(<DecisionCard decision={baseDecision} onResolve={mockResolve} />);

    const resolveButton = screen.getByRole('button', { name: /resolve this decision/i });
    await user.click(resolveButton);

    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Wrong')).toBeInTheDocument();
    expect(screen.getByText('Partial')).toBeInTheDocument();
  });

  it('clicking a resolution option updates the commit status', async () => {
    const user = userEvent.setup();
    render(<DecisionCard decision={baseDecision} onResolve={mockResolve} />);

    const resolveButton = screen.getByRole('button', { name: /resolve this decision/i });
    await user.click(resolveButton);

    const correctButton = screen.getByText('Correct');
    await user.click(correctButton);

    expect(mockResolve).toHaveBeenCalledWith('a3f1', 'correct');
  });

  it('shows resolved badge with the chosen resolution', () => {
    const resolvedDecision: Decision = { ...baseDecision, status: 'correct' };
    render(<DecisionCard decision={resolvedDecision} onResolve={mockResolve} />);
    expect(screen.getByText(/correct/i)).toBeInTheDocument();
    // Resolve button should not be present for resolved decisions
    expect(screen.queryByRole('button', { name: /resolve/i })).not.toBeInTheDocument();
  });
});
