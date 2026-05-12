const NOW = new Date();
export function ago(minutes: number): Date {
  return new Date(NOW.getTime() - minutes * 60_000);
}
export const ONE_DAY = 24 * 60;
