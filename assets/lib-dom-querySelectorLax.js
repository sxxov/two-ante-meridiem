export function querySelectorLax(
  /** @type {string | null | undefined} */ selector,
) {
  if (!selector) return undefined;

  try {
    return document.querySelector(selector.replace(/\s+/g, ' ')) ?? undefined;
  } catch {
    return undefined;
  }
}
