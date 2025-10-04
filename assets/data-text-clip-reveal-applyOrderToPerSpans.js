import { setStyles } from './lib-dom-setStyles.js';
import { some } from './lib-functional-some.js';
import { unwrap } from './lib-functional-unwrap.js';

export function applyOrderToPerSpans(
  /** @type {HTMLSpanElement[]} */ spans,
  /** @type {number} */ noise = 0,
) {
  const { length } = spans;
  const initialOrders = Array.from({ length }, (_, i) => i);
  const randomOrders = [...initialOrders].sort(() => Math.random() - 0.5);
  const randomOrderToRank = randomOrders.reduce((acc, order, rank) => {
    acc[order] = rank;
    return acc;
  }, /** @type {Record<number, number>} */ ({}));
  const scores = initialOrders.map(
    (order) =>
      (1 - noise) * order + noise * Number(randomOrderToRank[order]) || 0,
  );
  const orders = [...initialOrders].sort((a, b) => {
    const scoreA = scores[a];
    const scoreB = scores[b];

    if (!some(scoreA) || !some(scoreB)) return 0;

    return scoreA - scoreB;
  });

  for (let i = 0; i < length; i++) {
    const span = unwrap(spans[i]);

    setStyles(span, {
      '--per-order': `${orders[i]}`,
    });
  }
}
