export interface SnakeItem {
  key: string;
  top: number;
  left: number;
}

export interface SnakeStep {
  key: string;
  fromTop: boolean;
  index: number;
}

export function computeSnakeOrder(items: SnakeItem[], rowTolerance = 8): SnakeStep[] {
  const rows: { top: number; items: SnakeItem[] }[] = [];
  for (const it of items) {
    let row = rows.find((r) => Math.abs(r.top - it.top) <= rowTolerance);
    if (!row) {
      row = { top: it.top, items: [] };
      rows.push(row);
    } else {
      row.top = Math.min(row.top, it.top);
    }
    row.items.push(it);
  }
  rows.sort((a, b) => a.top - b.top);

  const seq: SnakeStep[] = [];
  rows.forEach((row, ri) => {
    row.items.sort((a, b) => a.left - b.left);
    const fromTop = ri % 2 === 0;
    const ordered = fromTop ? row.items : row.items.slice().reverse();
    for (const it of ordered) seq.push({ key: it.key, fromTop, index: seq.length });
  });
  return seq;
}
