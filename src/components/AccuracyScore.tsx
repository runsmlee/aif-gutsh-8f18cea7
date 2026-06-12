import { useDecisions } from '../hooks/useDecisions';

export default function AccuracyScore() {
  const { getAccuracy } = useDecisions();
  const accuracy = getAccuracy();

  // Track analytics view
  if (typeof window !== 'undefined' && window.aif?.track && accuracy.total > 0) {
    window.aif.track('accuracy_viewed', { percentage: accuracy.percentage });
  }

  if (accuracy.total === 0) {
    return (
      <div className="text-center">
        <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono">Accuracy</h2>
        <p className="text-sm text-[var(--color-text-tertiary)] font-mono mt-1">No resolutions yet</p>
      </div>
    );
  }

  const getScoreColor = () => {
    if (accuracy.percentage >= 70) return 'text-emerald-600';
    if (accuracy.percentage >= 40) return 'text-amber-600';
    return 'text-primary';
  };

  return (
    <div className="text-center space-y-1">
      <h2 className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-mono">Accuracy</h2>
      <p className={`text-3xl font-bold font-mono ${getScoreColor()} leading-none`}>{accuracy.percentage}%</p>
      <div className="flex justify-center gap-3 text-xs text-[var(--color-text-tertiary)] font-mono">
        <span>{accuracy.correct} correct</span>
        <span>{accuracy.incorrect} incorrect</span>
        <span>{accuracy.partial} partial</span>
      </div>
    </div>
  );
}
