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
    <div className="bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
      {/* Terminal header bar */}
      <div className="flex items-center px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-secondary)]">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
          <div className="w-2 h-2 rounded-full bg-primary/20"></div>
        </div>
        <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono ml-2 select-none">gut.sh</span>
      </div>

      {/* Terminal body */}
      <div className="px-4 py-3 sm:px-5 sm:py-4 space-y-1">
        {/* Decision prompt */}
        <div className="flex items-center gap-2 min-h-[44px]">
          <span className="text-primary font-mono text-sm select-none" aria-hidden="true">$</span>
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
            placeholder="your decision"
            aria-label="Decision text"
            aria-invalid={!!errors.decision}
            className="w-full bg-transparent border-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none font-mono text-base"
          />
        </div>

        {errors.decision && (
          <p className="text-primary text-xs flex items-center gap-1 pl-5" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v5M6 8.5h.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Decision is required
          </p>
        )}

        {/* Prediction prompt */}
        <div className="flex items-center gap-2 min-h-[44px]">
          <span className="text-[var(--color-text-tertiary)] font-mono text-sm select-none" aria-hidden="true">{'>'}</span>
          <input
            id="prediction-input"
            type="text"
            value={predictionText}
            onChange={(e) => {
              setPredictionText(e.target.value);
              if (errors.prediction) setErrors((prev) => ({ ...prev, prediction: undefined }));
            }}
            onKeyDown={handleKeyDown}
            placeholder="what you predict will happen"
            aria-label="Prediction text"
            aria-invalid={!!errors.prediction}
            className="w-full bg-transparent border-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:outline-none font-mono text-base"
          />
        </div>

        {errors.prediction && (
          <p className="text-primary text-xs flex items-center gap-1 pl-5" role="alert">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M6 1v5M6 8.5h.005" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Prediction is required
          </p>
        )}

        {/* Confidence */}
        <div className="flex items-center gap-3 pt-3 mt-1 border-t border-[var(--color-border-subtle)]">
          <span className="text-[11px] text-[var(--color-text-tertiary)] font-mono uppercase tracking-wider select-none">conf</span>
          <input
            id="confidence-slider"
            type="range"
            min="1"
            max="10"
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
            className="flex-1 h-1.5 accent-primary cursor-pointer"
            aria-label="Confidence level"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={confidence}
          />
          <span className={`text-xs font-bold font-mono ${confidenceColor}`} data-testid="confidence-value">
            {confidence}/10
          </span>
        </div>

        {/* Keyboard hints */}
        <div className="pt-1">
          <p className="text-[11px] text-[var(--color-text-tertiary)] font-mono flex items-center gap-1.5">
            <kbd className="inline-flex items-center px-1 py-0.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] min-h-[18px]">Enter</kbd>
            <span>commit</span>
            <span className="text-[var(--color-border)]" aria-hidden="true">·</span>
            <kbd className="inline-flex items-center px-1 py-0.5 bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded text-[10px] font-mono text-[var(--color-text-secondary)] min-h-[18px]">⌘G</kbd>
            <span>focus</span>
          </p>
        </div>
      </div>
    </div>
  );
}
