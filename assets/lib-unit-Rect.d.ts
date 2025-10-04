import { type Point } from './lib-unit-Point.js';
import { type Size } from './lib-unit-Size.js';

export type Rect<T = number> = Point<T> & Size<T>;
