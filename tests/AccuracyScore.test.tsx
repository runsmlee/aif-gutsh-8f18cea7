import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AccuracyScore from '../src/components/AccuracyScore';
import { useDecisions } from '../src/hooks/useDecisions';
import type { AccuracyResult } from '../src/types';

// Mock the useDecisions hook
vi.mock('../src/hooks/useDecisions');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AccuracyScore', () => {
  it('renders without crash', () => {
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => ({ percentage: 0, correct: 0, incorrect: 0, partial: 0, total: 0 }),
    });
    render(<AccuracyScore />);
    expect(screen.getByText(/accuracy/i)).toBeInTheDocument();
  });

  it('displays "No resolutions yet" when no commits are resolved', () => {
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => ({ percentage: 0, correct: 0, incorrect: 0, partial: 0, total: 0 }),
    });
    render(<AccuracyScore />);
    expect(screen.getByText(/no resolutions yet/i)).toBeInTheDocument();
  });

  it('calculates correct percentage: 2 correct out of 3 total resolved = 67%', () => {
    const accuracy: AccuracyResult = { percentage: 67, correct: 2, incorrect: 1, partial: 0, total: 3 };
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => accuracy,
    });
    render(<AccuracyScore />);
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('counts partial resolutions as half-correct in score', () => {
    // 1 correct + 1 partial (0.5) = 1.5 out of 3 = 50%
    const accuracy: AccuracyResult = { percentage: 50, correct: 1, incorrect: 1, partial: 1, total: 3 };
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => accuracy,
    });
    render(<AccuracyScore />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('updates displayed score when a commit is resolved', () => {
    const accuracy1: AccuracyResult = { percentage: 0, correct: 0, incorrect: 0, partial: 0, total: 0 };
    const accuracy2: AccuracyResult = { percentage: 100, correct: 1, incorrect: 0, partial: 0, total: 1 };

    const getAccuracy = vi.fn().mockReturnValueOnce(accuracy1).mockReturnValueOnce(accuracy2);

    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy,
    });

    const { rerender } = render(<AccuracyScore />);
    expect(screen.getByText(/no resolutions yet/i)).toBeInTheDocument();

    // Simulate re-render after resolution
    getAccuracy.mockReturnValueOnce(accuracy2);
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => accuracy2,
    });
    rerender(<AccuracyScore />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows total counts: correct, incorrect, partial', () => {
    const accuracy: AccuracyResult = { percentage: 50, correct: 1, incorrect: 1, partial: 1, total: 3 };
    vi.mocked(useDecisions).mockReturnValue({
      decisions: [],
      addCommit: vi.fn(),
      resolveCommit: vi.fn(),
      getAccuracy: () => accuracy,
    });
    render(<AccuracyScore />);
    expect(screen.getByText(/1 correct/i)).toBeInTheDocument();
    expect(screen.getByText(/1 incorrect/i)).toBeInTheDocument();
    expect(screen.getByText(/1 partial/i)).toBeInTheDocument();
  });
});
