import type { ChallengeId } from '../../core/challenges';
import { ComprehensionView } from './ComprehensionView';
import { FillSentenceView } from './FillSentenceView';
import type { ChallengeView } from './types';
import { WordBuildView } from './WordBuildView';
import { WordMatchView } from './WordMatchView';

export type ViewChallengeId = Exclude<ChallengeId, 'clueHunt'>;

export const VIEWS: Record<ViewChallengeId, () => ChallengeView<unknown>> = {
  wordBuild: () => new WordBuildView() as ChallengeView<unknown>,
  wordMatch: () => new WordMatchView() as ChallengeView<unknown>,
  fillSentence: () => new FillSentenceView() as ChallengeView<unknown>,
  comprehension: () => new ComprehensionView() as ChallengeView<unknown>,
};
