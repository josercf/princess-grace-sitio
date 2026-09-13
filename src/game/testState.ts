export const testState: {
  answerPlan: string[];
  dialogueText: string | null;
  interact: ((npc: string) => void) | null;
  walker: ((id: string) => { texture: string; facing: string } | null) | null;
} = { answerPlan: [], dialogueText: null, interact: null, walker: null };
