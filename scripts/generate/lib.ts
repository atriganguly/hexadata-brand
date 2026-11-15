/** Small naming/number helpers shared by the platform emitters. */
export const snake = (s: string): string =>
  s
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
export const upperSnake = (s: string): string => snake(s).toUpperCase();
export const pascal = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_]([a-z0-9])/g, (_m, c: string) => c.toUpperCase());
export const camel = (s: string): string => {
  const p = pascal(s.replace(/-/g, '_'));
  return p.charAt(0).toLowerCase() + p.slice(1);
};
/** '1.5rem' -> 24, '4px' -> 4, '120ms' -> 120, '0' -> 0, '1.2' -> 1.2 */
export const toNumber = (css: string): number => {
  const n = parseFloat(css);
  return css.endsWith('rem') ? n * 16 : n;
};
export const noHash = (hex: string): string => hex.replace('#', '').toUpperCase();
/** Role names that exist in the semantic map, in stable order. */
export const roleNames = (semantic: Record<string, string>): string[] => Object.keys(semantic);
