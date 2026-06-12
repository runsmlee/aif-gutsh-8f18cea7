import { useState } from 'react';
import type { Decision } from '../types';

interface DecisionCardProps {
  decision: Decision;
  onResolve: (hash: string, status: 'correct' | 'incorrect' | 'partial') => void;
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const statusStyles: Record<string, string> = {
  unresolved: 'bg-[var(--color-surface-secondary)] text-[var(--color-text-tertiary)]',
  correct: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  incorrect: 'bg-primary-50 text-primary-700 border border-primary-200',
  partial: 'bg-amber-50 text-amber-700 border border-amber-200',
};

const statusDotStyles: Record<string, string> = {
  unresolved: 'bg-[var(--color-text-tertiary)]',
  correct: 'bg-emerald-500',
  incorrect: 'bg-primary',
  partial: 'bg-amber-500',
};

export default function DecisionCard({ decision, onResolve }: DecisionCardProps) {
  const [showResolveOptions, setShowResolveOptions] = useState(false);

  const handleResolve = (status: 'correct' | 'incorrect' | 'partial') => {
    onResolve(decision.hash, status);
    setShowResolveOptions(false);

    // Track analytics
    if (typeof window !== 'undefined' && window.aif?.track) {
      window.aif.track('commit_resolved', { hash: decision.hash, status });
    }
  };

  return (
    <article className="group border border-[var(--color-border)] rounded-xl p-4 sm:p-5 bg-[var(--color-surface-elevated)] shadow-sm hover:shadow-md hover:border-[var(--color-text-tertiary)]/30 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-semibold text-[15px] text-[var(--color-text-primary)] leading-snug break-words">{decision.decision}</p>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed break-words">{decision.prediction}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono capitalize whitespace-nowrap flex-shrink-0 ${statusStyles[decision.status]}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDotStyles[decision.status]}`} aria-hidden="true"></span>
          {decision.status}
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] font-mono">
        <span className="inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4 1v2M8 1v2M1.5 5h9M2 2h8a1 1 0 011 1v7a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {decision.hash}
        </span>
        <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
        <span>{formatTimestamp(decision.timestamp)}</span>
        <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M6 1l1.5 3 3.5.5-2.5 2.5.5 3.5L6 9l-3 1.5.5-3.5L1 4.5l3.5-.5L6 1z" stroke="currentColor" strokeWidth="0.75" strokeLinejoin="round"/>
          </svg>
          {decision.confidence}/10
        </span>
      </div>

      {decision.status === 'unresolved' && !showResolveOptions && (
        <button
          onClick={() => setShowResolveOptions(true)}
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-700 font-medium py-1.5 px-2 -ml-2 rounded-md hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-primary min-h-[32px]"
          aria-label="Resolve this decision"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Resolve
        </button>
      )}

      {showResolveOptions && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleResolve('correct')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 hover:text-emerald-800 border border-emerald-200 min-h-[40px] sm:min-h-[36px] focus-visible:outline-2 focus-visible:outline-emerald-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Correct
          </button>
          <button
            onClick={() => handleResolve('incorrect')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 hover:text-primary-800 border border-primary-200 min-h-[40px] sm:min-h-[36px] focus-visible:outline-2 focus-visible:outline-primary"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Wrong
          </button>
          <button
            onClick={() => handleResolve('partial')}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 hover:text-amber-800 border border-amber-200 min-h-[40px] sm:min-h-[36px] focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 2v5M7 9h.007" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Partial
          </button>
        </div>
      )}
    </article>
  );
}
