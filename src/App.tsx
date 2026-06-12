import { useEffect } from 'react';
import DecisionLogger from './components/DecisionLogger';
import DecisionFeed from './components/DecisionFeed';
import AccuracyScore from './components/AccuracyScore';
import { DecisionsProvider, useDecisions } from './hooks/useDecisions';

function AppContent() {
  const { decisions, resolveCommit } = useDecisions();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.aif?.track) {
      window.aif.track('page_view', { path: window.location.pathname });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-surface)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-10 bg-[var(--color-surface)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm font-mono">g</span>
            </div>
            <h1 className="text-xl font-bold font-mono tracking-tight text-[var(--color-text-primary)]">
              gut<span className="text-primary">.sh</span>
            </h1>
          </div>
          <AccuracyScore />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        <section aria-label="Log a decision" className="space-y-3">
          <p className="text-center text-xl sm:text-2xl font-bold font-mono text-[var(--color-text-primary)] leading-snug tracking-tight">
            Every bold call is a hypothesis.{' '}
            <span className="text-primary">Commit</span> it.{' '}
            <span className="text-primary">Prove</span> it.
          </p>
          <DecisionLogger />
        </section>

        <section aria-label="Decision feed">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider font-mono">
              Feed
            </h2>
            {decisions.length > 0 && (
              <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
                {decisions.length} {decisions.length === 1 ? 'commit' : 'commits'}
              </span>
            )}
          </div>
          <DecisionFeed decisions={decisions} onResolve={resolveCommit} />
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] mt-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 text-center">
          <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
            gut.sh
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <DecisionsProvider>
      <AppContent />
    </DecisionsProvider>
  );
}
