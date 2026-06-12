import { useState, useRef, useEffect, useCallback } from 'react';
import { useDecisions } from '../hooks/useDecisions';
import type { Decision } from '../types';

interface DecisionLoggerProps {
  onCommit?: (commit: Decision) => void;
}

export default function DecisionLogger({ onCommit }: DecisionLoggerProps) {
  const { addCommit } = useDecisions();
  const [decisionText, setDecisionText] = useState('');
  const [predictionText, setPredictionText] = useState('');
  const [confidence, setConfidence] = useState(5);
  const [errors, setErrors] = useState<{ decision?: string; prediction?: string }>({});
  const decisionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus on mount
    decisionInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Global hotkey: Cmd/Ctrl+G
    function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        decisionInputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, []);

  const handleSubmit = useCallback(() => {
    const newErrors: { decision?: string; prediction?: string } = {};
    if (!decisionText.trim()) {
      newErrors.decision = 'Decision is required';
    }
    if (!predictionText.trim()) {
      newErrors.prediction = 'Prediction is required';
    }
    if (newErrors.decision || newErrors.prediction) {
      setErrors(newErrors);
      return;
    }

    const commit = addCommit({
      decision: decisionText.trim(),
      prediction: predictionText.trim(),
      confidence,
    });

    // Track analytics
    if (typeof window !== 'undefined' && window.aif?.track) {
      window.aif.track('commit_created', { hash: commit.hash, confidence });
    }

    onCommit?.(commit);
    setDecisionText('');
    setPredictionText('');
    setConfidence(5);
    setErrors({});
    decisionInputRef.current?.focus();
  }, [decisionText, predictionText, confidence, addCommit, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const confidenceColor = confidence <= 3 ? 'text-amber-500' : confidence <= 6 ? 'text-[var(--color-text-secondary)]' : 'text-primary';

  return (
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true"></div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)] font-mono">New commit</h2>
      </div>

      <div>
        <label htmlFor="decision-input" className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1.5 font-mono uppercase tracking-wider">
          Decision
        </label>
        <input
          id="decision-input"
          ref={decisionInputRef}
          type="text"
          value={decisionText}
          onChange={(e) => {
            setDecisionText(e.target.value);
            if (errors.decision) setErrors((prev) => ({ ...prev, decision: undefined }));
          }}
          onKeyDown={handleKeyDown}
          placeholder="Your decision"
          aria-label="Decision text"
          aria-invalid={!!errors.decision}
          className="w-full h-11 px-4 border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-[var(--color-text-tertiary)] text-base"
        />
        {errors.decision && (
          <p className="text-primary text-xs mt-1.5 flex items-center gap-1" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v5M6 8.5h.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Decision is required
          </p>
        )}
      </div>

      <div>
        <label htmlFor="prediction-input" className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1.5 font-mono uppercase tracking-wider">
          Prediction
        </label>
        <input
          id="prediction-input"
          type="text"
          value={predictionText}
          onChange={(e) => {
            setPredictionText(e.target.value);
            if (errors.prediction) setErrors((prev) => ({ ...prev, prediction: undefined }));
          }}
          onKeyDown={handleKeyDown}
          placeholder="What do you predict will happen?"
          aria-label="Prediction text"
          aria-invalid={!!errors.prediction}
          className="w-full h-11 px-4 border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] bg-[var(--color-surface)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary hover:border-[var(--color-text-tertiary)] text-base"
        />
        {errors.prediction && (
          <p className="text-primary text-xs mt-1.5 flex items-center gap-1" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v5M6 8.5h.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Prediction is required
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="confidence-slider" className="text-xs font-medium text-[var(--color-text-tertiary)] font-mono uppercase tracking-wider">
            Confidence
          </label>
          <span className={`text-sm font-bold font-mono ${confidenceColor}`} data-testid="confidence-value">
            {confidence}/10
          </span>
        </div>
        <input
          id="confidence-slider"
          type="range"
          min="1"
          max="10"
          value={confidence}
          onChange={(e) => setConfidence(Number(e.target.value))}
          className="w-full h-2 accent-primary cursor-pointer"
          aria-label="Confidence level"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={confidence}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">Low</span>
          <span className="text-[10px] text-[var(--color-text-tertiary)] font-mono">High</span>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--color-border-subtle)]">
        <p className="text-xs text-[var(--color-text-tertiary)] font-mono flex items-center gap-2 flex-wrap">
          <kbd className="inline-flex items-center px-1.5 py-0.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] min-h-[20px]">Enter</kbd>
          <span>to commit</span>
          <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
          <kbd className="inline-flex items-center px-1.5 py-0.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] min-h-[20px]">⌘G</kbd>
          <span>to focus</span>
        </p>
      </div>
    </div>
  );
}
