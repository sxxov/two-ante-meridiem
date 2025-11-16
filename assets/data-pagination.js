import { PaginationSlotBehavior } from './data-pagination-slot.js';
import {
  attachBehavior,
  behavior,
  registerGlobalBehaviors,
  t,
} from './lib-behavior.js';
import { queueMicrotask } from './lib-dom-queueMicrotask.js';
import { bin, Signal } from './lib-signal.js';

export const PaginationBehavior = behavior(
  'pagination',
  class {
    section = t.string;
    length = t.number;
    indices = new Signal(new /** @type {typeof Set<number>} */ (Set)());
  },
  (element, {}, { registerLocalBehaviors }) => {
    registerLocalBehaviors(PaginationSlotBehavior);

    const _ = bin();

    const decrement = document.createElement('div');
    add: {
      attachBehavior(decrement, PaginationSlotBehavior, { '': -1 });
      element.prepend(decrement);
    }
    remove: _._ = () => { decrement.remove(); };
    const increment = document.createElement('div');
    add: {
      attachBehavior(increment, PaginationSlotBehavior, { '': 1 });
      element.append(increment);
    }
    remove: _._ = () => { increment.remove(); };

    return _;
  },
);

queueMicrotask(() => { registerGlobalBehaviors(PaginationBehavior); });
