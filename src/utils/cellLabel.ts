export function cellLabel(row: number, col: number): string {
  const rowLetter = String.fromCharCode(65 + row);
  return `${rowLetter}${col + 1}`;
}
