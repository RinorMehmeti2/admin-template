/*
 * Subsequence fuzzy matcher with score boosts for prefix and word-start hits.
 * Returns { matched, score }. Empty query matches everything with score 0.
 */

export interface FuzzyResult {
  matched: boolean;
  score: number;
}

const NON_MATCH: FuzzyResult = { matched: false, score: 0 };

function isWordBoundary(ch: string): boolean {
  return ch === ' ' || ch === '-' || ch === '_' || ch === '/' || ch === '.';
}

export function fuzzyMatch(query: string, text: string): FuzzyResult {
  if (query.length === 0) return { matched: true, score: 0 };
  if (text.length === 0) return NON_MATCH;

  const q = query.toLowerCase();
  const t = text.toLowerCase();

  let qi = 0;
  let score = 0;
  let prevMatchIdx = -2;

  for (let i = 0; i < t.length && qi < q.length; i += 1) {
    if (t[i] !== q[qi]) continue;
    let boost = 1;
    if (i === 0) boost += 6;
    else if (isWordBoundary(t[i - 1] ?? '')) boost += 4;
    if (prevMatchIdx === i - 1) boost += 2;
    score += boost;
    prevMatchIdx = i;
    qi += 1;
  }

  if (qi < q.length) return NON_MATCH;
  // Slight penalty for length so shorter labels rank higher when otherwise equal.
  return { matched: true, score: score - text.length * 0.05 };
}

export interface CommandLike {
  label: string;
  keywords?: ReadonlyArray<string>;
}

export function scoreCommand(query: string, cmd: CommandLike): FuzzyResult {
  const labelResult = fuzzyMatch(query, cmd.label);
  let best: FuzzyResult = labelResult;
  if (cmd.keywords !== undefined) {
    for (const kw of cmd.keywords) {
      const r = fuzzyMatch(query, kw);
      if (r.matched && r.score > best.score) best = r;
    }
  }
  return best;
}
