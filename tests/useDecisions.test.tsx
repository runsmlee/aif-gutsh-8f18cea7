import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDecisions, DecisionsProvider } from '../src/hooks/useDecisions';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <DecisionsProvider>{children}</DecisionsProvider>;
}

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(Storage.prototype, 'setItem');
  vi.spyOn(Storage.prototype, 'getItem');
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useDecisions', () => {
  it('initializes with empty array when no localStorage data', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });
    expect(result.current.decisions).toEqual([]);
  });

  it('addCommit creates a commit with unique hash, timestamp, and all fields', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({
        decision: 'Pivot to enterprise',
        prediction: 'ARR doubles in 6 months',
        confidence: 8,
      });
    });

    const commit = result.current.decisions[0];
    expect(commit).toBeDefined();
    expect(commit.hash).toBeTruthy();
    expect(commit.hash.length).toBeGreaterThanOrEqual(4);
    expect(commit.timestamp).toBeGreaterThan(0);
    expect(commit.decision).toBe('Pivot to enterprise');
    expect(commit.prediction).toBe('ARR doubles in 6 months');
    expect(commit.confidence).toBe(8);
    expect(commit.status).toBe('unresolved');
  });

  it('addCommit persists to localStorage', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({
        decision: 'Hire CTO',
        prediction: 'Product velocity doubles',
        confidence: 7,
      });
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'gutsh_decisions',
      expect.any(String),
    );

    // Verify the stored data can be parsed back
    const stored = JSON.parse(localStorage.getItem('gutsh_decisions') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].decision).toBe('Hire CTO');
  });

  it('resolveCommit updates the status of a specific commit by hash', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({
        decision: 'Test decision',
        prediction: 'Test prediction',
        confidence: 5,
      });
    });

    const hash = result.current.decisions[0].hash;

    act(() => {
      result.current.resolveCommit(hash, 'correct');
    });

    expect(result.current.decisions[0].status).toBe('correct');
  });

  it('resolveCommit persists updated data to localStorage', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({
        decision: 'Test decision',
        prediction: 'Test prediction',
        confidence: 5,
      });
    });

    const hash = result.current.decisions[0].hash;

    act(() => {
      result.current.resolveCommit(hash, 'incorrect');
    });

    const stored = JSON.parse(localStorage.getItem('gutsh_decisions') || '[]');
    expect(stored[0].status).toBe('incorrect');
  });

  it('getAccuracy returns 0 when no resolutions exist', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({
        decision: 'Test',
        prediction: 'Test pred',
        confidence: 5,
      });
    });

    const accuracy = result.current.getAccuracy();
    expect(accuracy.percentage).toBe(0);
    expect(accuracy.total).toBe(0);
  });

  it('getAccuracy returns correct percentage based on resolutions', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    // Add 3 commits and resolve 2 correct, 1 incorrect
    act(() => {
      result.current.addCommit({ decision: 'D1', prediction: 'P1', confidence: 5 });
      result.current.addCommit({ decision: 'D2', prediction: 'P2', confidence: 5 });
      result.current.addCommit({ decision: 'D3', prediction: 'P3', confidence: 5 });
    });

    const hash1 = result.current.decisions[0].hash;
    const hash2 = result.current.decisions[1].hash;
    const hash3 = result.current.decisions[2].hash;

    act(() => {
      result.current.resolveCommit(hash1, 'correct');
      result.current.resolveCommit(hash2, 'correct');
      result.current.resolveCommit(hash3, 'incorrect');
    });

    const accuracy = result.current.getAccuracy();
    expect(accuracy.percentage).toBe(67);
    expect(accuracy.correct).toBe(2);
    expect(accuracy.incorrect).toBe(1);
    expect(accuracy.total).toBe(3);
  });

  it('hashes are unique across multiple commits', () => {
    const { result } = renderHook(() => useDecisions(), { wrapper });

    act(() => {
      result.current.addCommit({ decision: 'D1', prediction: 'P1', confidence: 5 });
      result.current.addCommit({ decision: 'D2', prediction: 'P2', confidence: 5 });
      result.current.addCommit({ decision: 'D3', prediction: 'P3', confidence: 5 });
    });

    const hashes = result.current.decisions.map((d) => d.hash);
    const uniqueHashes = new Set(hashes);
    expect(uniqueHashes.size).toBe(3);
  });
});
