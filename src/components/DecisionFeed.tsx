import DecisionCard from './DecisionCard';
import type { Decision } from '../types';

interface DecisionFeedProps {
  decisions: Decision[];
  onResolve: (hash: string, status: 'correct' | 'incorrect' | 'partial') => void;
}

export default function DecisionFeed({ decisions, onResolve }: DecisionFeedProps) {
  if (decisions.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 px-4">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--color-surface-secondary)] border border-[var(--color-border)] flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
            <path d="M14 4v8M14 18h.01M6 6l3 3M22 6l-3 3M4 14h4M20 14h4" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="14" cy="14" r="10" stroke="var(--color-text-tertiary)" strokeWidth="1.5"/>
          </svg>
        </div>
        <p className="font-mono text-sm text-[var(--color-text-secondary)] font-medium">No commits yet</p>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-2 max-w-[280px] mx-auto leading-relaxed">
          Start logging your decisions to track how accurate your intuition really is.
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)] font-mono mt-4">
          Press <kbd className="inline-flex items-center px-1.5 py-0.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] min-h-[20px]">⌘G</kbd> to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" role="list" aria-label="Decision feed">
      {decisions.map((decision) => (
        <div key={decision.hash} role="listitem">
          <DecisionCard decision={decision} onResolve={onResolve} />
        </div>
      ))}
    </div>
  );
}
