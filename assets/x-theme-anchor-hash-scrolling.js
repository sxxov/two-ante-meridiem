document.body.addEventListener('click', (event) => {
  const { target } = event;
  if (!(target instanceof Element)) return;

  const anchor = target.closest('a');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (!anchor.hash) return;

  const url = (() => {
    try {
      return new URL(anchor.href);
    } catch {}
  })();
  if (!url) return;

  if (url.origin !== window.location.origin) return;
  if (url.pathname !== window.location.pathname) return;

  document.querySelector(anchor.hash)?.scrollIntoView({
    behavior: 'smooth',
  });
});
