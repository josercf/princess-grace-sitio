export const MAX_NAME_LENGTH = 12;

export function formatCompanionName(raw: string): string {
  const letters = Array.from(raw.trim()).slice(0, MAX_NAME_LENGTH);
  if (letters.length === 0) return '';
  const [first, ...rest] = letters;
  return (first as string).toLocaleUpperCase('pt-BR') + rest.join('').toLocaleLowerCase('pt-BR');
}
