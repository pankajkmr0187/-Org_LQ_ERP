export async function collectValidationErrors(page) {
  // Runs in browser context to collect visible validation/error messages and any related field name
  return await page.evaluate(() => {
    const selectors = [
      '[data-testid="error"]',
      '.error',
      '.input-error',
      '.invalid-feedback',
      '.field-error',
      '[role="alert"]',
      'small.error',
      '.text-red-500',
      '.text-red-600'
    ];

    const results = [];
    const seen = new Set();

    function pushResult(msg, selector, related) {
      const key = (related || '') + '|' + msg;
      if (!msg || seen.has(key)) return;
      seen.add(key);
      results.push({ message: msg.trim(), selector, related: related || null });
    }

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.innerText || el.textContent || '';
        if (!text || !text.trim()) return;

        // try to find related input/select/textarea by looking inside common ancestors
        let related = null;
        const parent = el.closest('div, form, fieldset') || el.parentElement;
        if (parent) {
          const input = parent.querySelector('input[name], textarea[name], select[name]');
          if (input) related = input.getAttribute('name') || input.id || input.getAttribute('aria-label');
        }

        // fallback: look for label[for] that references an input
        if (!related) {
          const label = el.closest('label');
          if (label) related = label.getAttribute('for') || (label.innerText || '').trim();
        }

        pushResult(text, sel, related);
      });
    });

    // Also check for aria-invalid fields
    document.querySelectorAll('input[aria-invalid="true"], textarea[aria-invalid="true"], select[aria-invalid="true"]').forEach(inp => {
      const name = inp.getAttribute('name') || inp.id || inp.getAttribute('aria-label') || inp.tagName.toLowerCase();
      const title = inp.title || inp.getAttribute('validationMessage') || '';
      pushResult(title || 'Field marked invalid', 'aria-invalid', name);
    });

    return results;
  });
}
