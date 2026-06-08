export function setup(ctx) {

  // --- SVG icon for the drawer tab ---
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="16" height="16" rx="3"/>
    <circle cx="7" cy="7" r="1.5"/>
    <path d="M2 13l4-4 3 3 3-4 4 5"/>
  </svg>`;

  // --- Register the drawer tab ---
  const tab = ctx.ui.registerDrawerTab({
    id: 'flux_image_gen',
    title: 'Flux Image Generator',
    shortName: 'Image',
    description: 'Generate images with Flux via Pollinations AI — free, no API key',
    keywords: ['image', 'flux', 'generate', 'art', 'picture', 'draw'],
    headerTitle: 'Image Generator',
    iconSvg: iconSvg,
  });

  // --- Build the UI inside the drawer tab ---
  tab.root.innerHTML = `
    <style>
      .flux-wrap {
        display: flex;
        flex-direction: column;
        height: 100%;
        padding: 12px;
        box-sizing: border-box;
        gap: 10px;
        font-family: inherit;
        color: inherit;
      }
      .flux-wrap textarea {
        width: 100%;
        min-height: 80px;
        resize: vertical;
        background: var(--color-surface-2, #1e1e2e);
        color: var(--color-text, #cdd6f4);
        border: 1px solid var(--color-border, #45475a);
        border-radius: 8px;
        padding: 10px;
        font-size: 13px;
        font-family: inherit;
        box-sizing: border-box;
        outline: none;
      }
      .flux-wrap textarea:focus {
        border-color: var(--color-accent, #cba6f7);
      }
      .flux-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .flux-wrap select {
        flex: 1;
        background: var(--color-surface-2, #1e1e2e);
        color: var(--color-text, #cdd6f4);
        border: 1px solid var(--color-border, #45475a);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 12px;
        font-family: inherit;
        outline: none;
        cursor: pointer;
      }
      .flux-btn {
        padding: 8px 16px;
        background: var(--color-accent, #cba6f7);
        color: #1e1e2e;
        border: none;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.15s;
      }
      .flux-btn:hover { opacity: 0.85; }
      .flux-btn:disabled { opacity: 0.45; cursor: not-allowed; }
      .flux-status {
        font-size: 12px;
        color: var(--color-text-muted, #a6adc8);
        min-height: 18px;
        text-align: center;
      }
      .flux-img-wrap {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 0;
      }
      .flux-img-card {
        background: var(--color-surface-2, #1e1e2e);
        border: 1px solid var(--color-border, #45475a);
        border-radius: 10px;
        overflow: hidden;
      }
      .flux-img-card img {
        width: 100%;
        display: block;
        border-radius: 10px 10px 0 0;
      }
      .flux-img-footer {
        padding: 6px 10px;
        font-size: 11px;
        color: var(--color-text-muted, #a6adc8);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 6px;
      }
      .flux-dl {
        padding: 3px 8px;
        background: var(--color-surface-3, #313244);
        color: var(--color-text, #cdd6f4);
        border: none;
        border-radius: 5px;
        font-size: 11px;
        cursor: pointer;
        text-decoration: none;
      }
      .flux-dl:hover { opacity: 0.8; }
      .flux-empty {
        text-align: center;
        font-size: 12px;
        color: var(--color-text-muted, #a6adc8);
        padding: 24px 0;
        opacity: 0.6;
      }
      .flux-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--color-text-muted, #a6adc8);
      }
    </style>

    <div class="flux-wrap">
      <div class="flux-label">Prompt</div>
      <textarea id="flux-prompt" placeholder="Describe the image you want to generate…"></textarea>

      <div class="flux-row">
        <select id="flux-size">
          <option value="1024/1024">1024×1024 (Square)</option>
          <option value="1280/720">1280×720 (Landscape)</option>
          <option value="720/1280">720×1280 (Portrait)</option>
          <option value="1920/1080">1920×1080 (Wide)</option>
        </select>
        <button class="flux-btn" id="flux-gen-btn">Generate</button>
      </div>

      <div class="flux-status" id="flux-status"></div>

      <div class="flux-img-wrap" id="flux-gallery">
        <div class="flux-empty">Your generated images will appear here.</div>
      </div>
    </div>
  `;

  // --- Wire up the generate button ---
  const promptEl = tab.root.querySelector('#flux-prompt');
  const sizeEl   = tab.root.querySelector('#flux-size');
  const genBtn   = tab.root.querySelector('#flux-gen-btn');
  const statusEl = tab.root.querySelector('#flux-status');
  const gallery  = tab.root.querySelector('#flux-gallery');

  genBtn.addEventListener('click', async () => {
    const prompt = promptEl.value.trim();
    if (!prompt) {
      statusEl.textContent = '⚠️ Please enter a prompt first.';
      return;
    }

    const [width, height] = sizeEl.value.split('/');

    // Pollinations AI — free Flux endpoint, no API key needed
    // Docs: https://image.pollinations.ai/
    const seed = Math.floor(Math.random() * 999999);
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;

    genBtn.disabled = true;
    statusEl.textContent = '⏳ Generating… (this can take 10–30 seconds)';

    try {
      // Pre-load the image to confirm it loaded before showing
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // Remove the "empty" placeholder if it exists
      const emptyMsg = gallery.querySelector('.flux-empty');
      if (emptyMsg) emptyMsg.remove();

      // Build the card
      const card = document.createElement('div');
      card.className = 'flux-img-card';

      const shortPrompt = prompt.length > 60 ? prompt.slice(0, 57) + '…' : prompt;

      card.innerHTML = `
        <img src="${imageUrl}" alt="${shortPrompt}" loading="lazy" />
        <div class="flux-img-footer">
          <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${shortPrompt}</span>
          <a class="flux-dl" href="${imageUrl}" download="flux-image-${seed}.jpg" target="_blank">⬇ Save</a>
        </div>
      `;

      // Insert newest image at the top
      gallery.insertBefore(card, gallery.firstChild);
      statusEl.textContent = '✅ Done!';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);

    } catch (err) {
      statusEl.textContent = '❌ Generation failed. Try a different prompt or try again.';
      console.error('[Flux Extension] Image load error:', err);
    } finally {
      genBtn.disabled = false;
    }
  });

  // Allow Ctrl+Enter / Cmd+Enter to generate
  promptEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      genBtn.click();
    }
  });

  // Cleanup on teardown
  return () => {
    tab.destroy();
  };
}
