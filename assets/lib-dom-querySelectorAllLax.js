export function querySelectorAllLax(
  /** @type {string | null | undefined} */ selector,
) {
  if (!selector) return [];

  try {
    return document.querySelectorAll(selector.replace(/\s+/g, ' ')) ?? [];
  } catch {
    return [];
  }
}
