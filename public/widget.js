(function () {
  // Find the script tag that loaded this file, to read its "id" query param
  const currentScript = document.currentScript;
  const scriptUrl = new URL(currentScript.src);
  const widgetId = scriptUrl.searchParams.get('id');
  const apiBase = scriptUrl.origin;

  if (!widgetId) {
    console.error('Widget: missing id parameter in script src');
    return;
  }

  // Fetch the widget's config from the public config endpoint
  fetch(`${apiBase}/widgets/${widgetId}/config`)
    .then((res) => {
      if (!res.ok) throw new Error('Widget not found');
      return res.json();
    })
    .then((config) => renderWidget(config))
    .catch((err) => console.error('Widget failed to load:', err));

  function renderWidget(config) {
    const container = document.createElement('div');
    container.style.cssText =
      'max-width:360px;padding:20px;border:1px solid #ddd;border-radius:8px;font-family:sans-serif;box-shadow:0 2px 8px rgba(0,0,0,0.08);';

    const title = document.createElement('h3');
    title.textContent = config.title;
    title.style.cssText = 'margin:0 0 8px 0;';
    container.appendChild(title);

    if (config.description) {
      const desc = document.createElement('p');
      desc.textContent = config.description;
      desc.style.cssText = 'margin:0 0 16px 0;color:#555;font-size:14px;';
      container.appendChild(desc);
    }

    const form = document.createElement('form');
    const inputs = {};

    (config.fields || []).forEach((field) => {
      const label = document.createElement('label');
      label.textContent = field.label;
      label.style.cssText = 'display:block;margin-bottom:4px;font-size:13px;';

      const input = document.createElement('input');
      input.type = field.type || 'text';
      input.name = field.name;
      input.required = !!field.required;
      input.style.cssText =
        'display:block;width:100%;padding:8px;margin-bottom:12px;border:1px solid #ccc;border-radius:4px;box-sizing:border-box;';

      inputs[field.name] = input;
      form.appendChild(label);
      form.appendChild(input);
    });

    // Honeypot field — hidden from real users, bots tend to fill it
    const honeypot = document.createElement('input');
    honeypot.type = 'text';
    honeypot.name = 'website';
    honeypot.style.cssText = 'position:absolute;left:-9999px;';
    honeypot.tabIndex = -1;
    honeypot.autocomplete = 'off';
    form.appendChild(honeypot);

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.textContent = config.button_text || 'Submit';
    submitBtn.style.cssText =
      'width:100%;padding:10px;background:#111;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;';
    form.appendChild(submitBtn);

    const statusMsg = document.createElement('div');
    statusMsg.style.cssText = 'margin-top:12px;font-size:13px;';
    container.appendChild(form);
    container.appendChild(statusMsg);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const data = {};
      Object.keys(inputs).forEach((name) => {
        data[name] = inputs[name].value;
      });

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      fetch(`${apiBase}/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetId: config.id,
          data,
          website: honeypot.value,
        }),
      })
        .then((res) => res.json().then((body) => ({ ok: res.ok, body })))
        .then(({ ok, body }) => {
          if (ok) {
            statusMsg.textContent = 'Thank you! Your submission was received.';
            statusMsg.style.color = 'green';
            form.reset();
          } else {
            statusMsg.textContent = body.error || 'Something went wrong.';
            statusMsg.style.color = 'red';
          }
        })
        .catch(() => {
          statusMsg.textContent = 'Network error. Please try again.';
          statusMsg.style.color = 'red';
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = config.button_text || 'Submit';
        });
    });

    // Inject into the page — right after the script tag
    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
  }
})();