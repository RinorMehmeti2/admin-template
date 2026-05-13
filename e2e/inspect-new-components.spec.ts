import { test, expect } from './fixtures';

/*
 * Diagnostic: find what's producing extra scrollbars on /new-components.
 * Captures every element whose scrollHeight exceeds clientHeight (i.e. has a
 * vertical scrollbar) along with its CSS overflow and a CSS selector path.
 */

test('inspect scrollable elements on /new-components', async ({ gotoSignedIn, page }) => {
  // Use a viewport that matches what the user is seeing (their screenshot
  // suggested an aside scrollbar was visible, which happens below ~900px).
  await page.setViewportSize({ width: 1366, height: 768 });
  await gotoSignedIn('/repeater');
  await page.waitForLoadState('networkidle');
  // Let layout settle.
  await page.waitForTimeout(600);

  const scrollers = await page.evaluate(() => {
    function selectorPath(el: Element): string {
      const parts: string[] = [];
      let node: Element | null = el;
      let depth = 0;
      while (node !== null && depth < 8) {
        let part = node.tagName.toLowerCase();
        if (node.id !== '') part += `#${node.id}`;
        const cls = (node.getAttribute('class') ?? '').trim().slice(0, 60);
        if (cls !== '') part += `.${cls.replace(/\s+/g, '.')}`;
        parts.unshift(part);
        node = node.parentElement;
        depth += 1;
      }
      return parts.join(' > ');
    }

    const out: Array<Record<string, unknown>> = [];

    const all = document.querySelectorAll('*');
    for (const el of Array.from(all)) {
      const cs = window.getComputedStyle(el);
      const overflowY = cs.overflowY;
      const overflowX = cs.overflowX;
      const isScrollableY =
        (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
      const isScrollableX =
        (overflowX === 'auto' || overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
      if (!isScrollableY && !isScrollableX) continue;
      const htmlEl = el as HTMLElement;
      // Scrollbar width = offsetWidth - clientWidth (vertical bar)
      // If > 0, a visible scrollbar gutter is present.
      const visibleBarW = htmlEl.offsetWidth - el.clientWidth;
      const visibleBarH = htmlEl.offsetHeight - el.clientHeight;
      out.push({
        path: selectorPath(el),
        tag: el.tagName.toLowerCase(),
        overflowY,
        overflowX,
        clientH: el.clientHeight,
        scrollH: el.scrollHeight,
        clientW: el.clientWidth,
        scrollW: el.scrollWidth,
        offsetW: htmlEl.offsetWidth,
        offsetH: htmlEl.offsetHeight,
        visibleVScrollbarPx: visibleBarW,
        visibleHScrollbarPx: visibleBarH,
        scrollbarWidth: cs.scrollbarWidth ?? '(unsupported)',
        hasVScrollbar: isScrollableY,
        hasHScrollbar: isScrollableX,
      });
    }
    return out;
  });

  console.log('=== Scrollable elements on /new-components ===');
  for (const s of scrollers) {
    console.log(JSON.stringify(s, null, 2));
  }
  console.log(`=== ${scrollers.length} scrollable element(s) found ===`);

  // Also report viewport + main dimensions
  const dims = await page.evaluate(() => {
    const main = document.querySelector('main');
    return {
      vw: window.innerWidth,
      vh: window.innerHeight,
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      mainW: main?.clientWidth ?? 0,
      mainH: main?.clientHeight ?? 0,
      mainScrollH: main?.scrollHeight ?? 0,
      mainOverflowY: main !== null ? window.getComputedStyle(main).overflowY : 'n/a',
    };
  });
  console.log('=== dimensions ===');
  console.log(JSON.stringify(dims, null, 2));

  // List direct body children + their heights, to find what overflows
  const bodyChildren = await page.evaluate(() => {
    return Array.from(document.body.children).map((el) => {
      const r = el.getBoundingClientRect();
      const htmlEl = el as HTMLElement;
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || null,
        cls: (el.getAttribute('class') ?? '').slice(0, 100),
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        height: Math.round(r.height),
        offsetH: htmlEl.offsetHeight,
        scrollH: el.scrollHeight,
      };
    });
  });
  console.log('=== body direct children ===');
  console.log(JSON.stringify(bodyChildren, null, 2));

  // Find elements whose bottom exceeds the viewport (i.e. extend below fold)
  const overhangers = await page.evaluate(() => {
    const vh = window.innerHeight;
    const out: Array<{
      tag: string;
      cls: string;
      top: number;
      bottom: number;
      h: number;
      inMain: boolean;
    }> = [];
    const all = document.querySelectorAll('body *');
    for (const el of Array.from(all)) {
      const r = el.getBoundingClientRect();
      // Anything extending below viewport, even by a pixel.
      if (r.bottom > vh + 1 && r.height > 30) {
        out.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') ?? '').slice(0, 100),
          top: Math.round(r.top),
          bottom: Math.round(r.bottom),
          h: Math.round(r.height),
          inMain: el.closest('main') !== null,
        });
      }
    }
    // Sort by bottom desc to find what extends furthest.
    out.sort((a, b) => b.bottom - a.bottom);
    return out.slice(0, 20);
  });
  console.log('=== elements overhanging viewport (outside <main>) ===');
  console.log(JSON.stringify(overhangers, null, 2));

  // Type into a Repeater input and re-inspect to see if interaction creates
  // a new scrollable region (focus + input could insert one).
  const inputs = page.getByRole('textbox', { name: /email|key|value|tag/i });
  const firstInput = inputs.first();
  if ((await firstInput.count()) > 0) {
    await firstInput.click();
    await firstInput.type('hello world');
    await page.waitForTimeout(400);
    const afterTyping = await page.evaluate(() => {
      const list: Array<{
        tag: string;
        cls: string;
        overflowY: string;
        scrollH: number;
        clientH: number;
      }> = [];
      for (const el of Array.from(document.querySelectorAll('*'))) {
        const cs = window.getComputedStyle(el);
        if (
          (cs.overflowY === 'auto' || cs.overflowY === 'scroll') &&
          el.scrollHeight > el.clientHeight
        ) {
          list.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.getAttribute('class') ?? '').slice(0, 100),
            overflowY: cs.overflowY,
            scrollH: el.scrollHeight,
            clientH: el.clientHeight,
          });
        }
      }
      return list;
    });
    console.log('=== after typing in Repeater input ===');
    console.log(JSON.stringify(afterTyping, null, 2));
  }

  await page.screenshot({ path: 'playwright-report/new-components-top.png', fullPage: false });
  // Scroll to PhonesDemo section
  await page.evaluate(() => {
    const el = document.getElementById('phones');
    el?.scrollIntoView();
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'playwright-report/new-components-phones.png', fullPage: false });
  // Scroll to bottom and capture again
  await page.evaluate(() => {
    const main = document.querySelector('main');
    main?.scrollTo(0, main.scrollHeight);
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'playwright-report/new-components-bottom.png', fullPage: false });

  expect(scrollers.length).toBeGreaterThanOrEqual(0);
});
