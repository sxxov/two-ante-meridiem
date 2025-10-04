/** @import {Rect} from './lib-unit-Rect.js' */

/**
 * Crawls up the DOM tree to get the offset of the element relative to the
 * document
 *
 * @returns {Rect}
 */
export function getElementDocumentOffset(
  /** @type {HTMLElement} */ el,
  {
    /** Useful for calculating the relative offset of `position: fixed` elements */
    visitNonOffsetParents = false,
  } = {},
) {
  let x = 0;
  let y = 0;
  /** @type {HTMLElement | null} */

  let ancestor = el;
  do {
    const { position } = getComputedStyle(ancestor);
    const { pageYOffset } = window;

    if (position === 'sticky') scrollTo({ top: 0, bypass: true });

    x += ancestor.offsetLeft;
    y += ancestor.offsetTop;

    if (position === 'sticky') scrollTo({ top: pageYOffset, bypass: true });
  } while (
    (ancestor = /** @type {HTMLElement | null} */ (
      visitNonOffsetParents ?
        (ancestor.offsetParent ?? ancestor.parentElement)
      : ancestor.offsetParent
    ))
  );

  return {
    x,
    y,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
}

function augmentAncestor(/** @type {HTMLElement} */ ancestor) {
  const { position } = getComputedStyle(ancestor);
  if (position !== 'sticky') return;

  const { parentElement } = ancestor;
  if (!parentElement) return;

  const children = [...parentElement.children].filter(
    (child) => child instanceof HTMLElement,
  );
  const stickyChildren = children.filter(
    (child) => getComputedStyle(child).position === 'sticky',
  );
  if (stickyChildren.length <= 0) return;

  const stickyChildAndInlinePositions = stickyChildren.map(
    (child) => /** @type {const} */ ([child, child.style.position]),
  );
  for (const [child] of stickyChildAndInlinePositions) {
    child.style.position = 'relative';
  }

  return () => {
    for (const [child, inlinePosition] of stickyChildAndInlinePositions) {
      child.style.position = inlinePosition;
    }
  };
}
