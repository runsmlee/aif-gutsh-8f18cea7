export interface Decision {
  hash: string;
  decision: string;
  prediction: string;
  confidence: number;
  timestamp: number;
  status: 'unresolved' | 'correct' | 'incorrect' | 'partial';
}

export interface AccuracyResult {
  percentage: number;
  correct: number;
  incorrect: number;
  partial: number;
  total: number;
}
