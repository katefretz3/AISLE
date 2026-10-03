// Swipe a phone sheet down to close it.
//
// The sheets show a grab handle, which promises this. A drag that starts near
// the top of a sheet (or anywhere in it while it is scrolled to the top) moves
// the sheet with the finger; letting go past the threshold closes it the same
// way Escape does, so Radix runs its normal close path and focus returns where
// it came from. Anything less springs back.
const SHEETS =
  '.catalog-modal, .swaps-modal, .receipt-modal, .help-modal, .starters-modal, .shelf-modal';
const CLOSE_AT = 110;

export function installSheetGesture() {
  if (typeof window === 'undefined' || !('ontouchstart' in window)) return;
  let sheet: HTMLElement | null = null;
  let startY = 0;
  let dy = 0;

  const reset = (el: HTMLElement) => {
    el.style.removeProperty('transform');
    el.style.removeProperty('transition');
  };

  window.addEventListener(
    'touchstart',
    e => {
      const target = e.target as Element | null;
      const el = target?.closest<HTMLElement>(SHEETS) ?? null;
      if (!el || !matchMedia('(max-width: 760px)').matches) return;
      const y = e.touches[0].clientY;
      const nearTop = y - el.getBoundingClientRect().top < 64;
      // Inside the list, a downward drag scrolls unless the sheet is already
      // at the top of its content.
      if (!nearTop && el.scrollTop > 0) return;
      if (target?.closest('input, textarea, select, [role="slider"]')) return;
      sheet = el;
      startY = y;
      dy = 0;
    },
    {passive: true},
  );

  window.addEventListener(
    'touchmove',
    e => {
      if (!sheet) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      if (dy > 4) {
        sheet.style.setProperty('transition', 'none', 'important');
        sheet.style.setProperty('transform', `translateY(${dy}px)`, 'important');
      }
    },
    {passive: true},
  );

  const end = () => {
    const el = sheet;
    sheet = null;
    if (!el) return;
    if (dy > CLOSE_AT) {
      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
      // The close animation takes over from here.
      setTimeout(() => reset(el), 260);
    } else {
      el.style.setProperty('transition', 'transform 0.2s ease', 'important');
      el.style.setProperty('transform', 'translateY(0)', 'important');
      setTimeout(() => reset(el), 220);
    }
  };
  window.addEventListener('touchend', end, {passive: true});
  window.addEventListener('touchcancel', end, {passive: true});
}
