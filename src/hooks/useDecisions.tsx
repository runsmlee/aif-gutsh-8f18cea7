import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';
import type { Decision, AccuracyResult } from '../types';

const STORAGE_KEY = 'gutsh_decisions';

function generateHash(existingHashes: Set<string>): string {
  const chars = '0123456789abcdef';
  let attempts = 0;
  while (attempts < 100) {
    let hash = '';
    for (let i = 0; i < 4; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingHashes.has(hash)) {
      return hash;
    }
    attempts++;
  }
  // Fallback: use timestamp-based suffix for uniqueness
  return Date.now().toString(16).slice(-4);
}

function loadDecisions(): Decision[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Decision[];
    }
  } catch {
    // Corrupted data, start fresh
  }
  return [];
}

function saveDecisions(decisions: Decision[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions));
}

interface DecisionsContextValue {
  decisions: Decision[];
  addCommit: (input: { decision: string; prediction: string; confidence: number }) => Decision;
  resolveCommit: (hash: string, status: 'correct' | 'incorrect' | 'partial') => void;
  getAccuracy: () => AccuracyResult;
}

const DecisionsContext = createContext<DecisionsContextValue | null>(null);

export function DecisionsProvider({ children }: { children: React.ReactNode }) {
  const [decisions, setDecisions] = useState<Decision[]>(() => loadDecisions());
  const decisionsRef = useRef(decisions);
  decisionsRef.current = decisions;

  useEffect(() => {
    saveDecisions(decisions);
  }, [decisions]);

  const addCommit = useCallback((input: { decision: string; prediction: string; confidence: number }): Decision => {
    const existingHashes = new Set(decisionsRef.current.map((d) => d.hash));
    const commit: Decision = {
      hash: generateHash(existingHashes),
      decision: input.decision,
      prediction: input.prediction,
      confidence: input.confidence,
      timestamp: Date.now(),
      status: 'unresolved',
    };
    setDecisions((prev) => [commit, ...prev]);
    return commit;
  }, []);

  const resolveCommit = useCallback((hash: string, status: 'correct' | 'incorrect' | 'partial') => {
    setDecisions((prev) =>
      prev.map((d) => (d.hash === hash ? { ...d, status } : d)),
    );
  }, []);

  const getAccuracy = useCallback((): AccuracyResult => {
    const resolved = decisionsRef.current.filter((d) => d.status !== 'unresolved');
    const total = resolved.length;
    if (total === 0) {
      return { percentage: 0, correct: 0, incorrect: 0, partial: 0, total: 0 };
    }
    const correct = resolved.filter((d) => d.status === 'correct').length;
    const incorrect = resolved.filter((d) => d.status === 'incorrect').length;
    const partial = resolved.filter((d) => d.status === 'partial').length;
    const score = correct + partial * 0.5;
    const percentage = Math.round((score / total) * 100);
    return { percentage, correct, incorrect, partial, total };
  }, []);

  return (
    <DecisionsContext.Provider value={{ decisions, addCommit, resolveCommit, getAccuracy }}>
      {children}
    </DecisionsContext.Provider>
  );
}

export function useDecisions(): DecisionsContextValue {
  const ctx = useContext(DecisionsContext);
  if (!ctx) {
    throw new Error('useDecisions must be used within a DecisionsProvider');
  }
  return ctx;
}
