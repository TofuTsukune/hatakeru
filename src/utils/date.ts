export function fmtShort(d: string | undefined): string | null {
  if (!d) return null;
  const [, m, day] = d.split('-');
  return `${+m}/${+day}`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
