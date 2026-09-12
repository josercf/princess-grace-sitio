export const testState: {
  answerPlan: string[];
  dialogueText: string | null;
  interact: ((npc: string) => void) | null;
} = { answerPlan: [], dialogueText: null, interact: null };
