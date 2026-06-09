export function setup(ctx) {

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="16" height="16" rx="3"/>
    <circle cx="7" cy="7" r="1.5"/>
    <path d="M2 13l4-4 3 3 3-4 4 5"/>
  </svg>`;

  const tab = ctx.ui.registerDrawerTab({
    id: 'flux_image_gen',
    title: 'Flux Image Generator',
    shortName: 'Image',
    description: 'Generate images with Flux via Puter.js — free, no API key',
    keywords: ['image', 'flux', 'generate', 'art', 'picture', 'draw'],
    headerTitle: 'Image Generator',
    iconSvg: iconSvg,
  });

  // Inject Puter.js script into the page if not already loaded
  function loadPuter() {
    return new Promise((resolve, reject) => {
      if (window.puter) { resolve(window.puter); return; }
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.onload = () => {
        // Give puter a moment to initialize
        const wait = setInterval(() => {
          if (window.puter && window.puter.ai) {
            clearInterval(wait);
            resolve(window.puter);
          }
        }, 100);
        setTimeout(() => { clearInterval(wait); reject(new Error('Puter init timeout')); }, 8000);
      };
      script.onerror = () => reject(new Error('Failed to load Puter.js'));
      document.head.appendChild(script);
    });
  }

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
      .flux-spinner {
        display: none;
        width: 100%;
        padding: 20px 0;
        text-align: center;
      }
      .flux-spinner.active { display: block; }
      .flux-spinner::after {
        content: '';
        display: inline-block;
        width: 28px;
        height: 28px;
        border: 3px solid var(--color-border, #45475a);
        border-top-color: var(--color-accent, #cba6f7);
        border-radius: 50%;
        animation: flux-spin 0.8s linear infinite;
      }
      @keyframes flux-spin { to { transform: rotate(360deg); } }
    </style>

    <div class="flux-wrap">
      <div class="flux-label">Prompt</div>
      <textarea id="flux-prompt" placeholder="Describe the image you want to generate…"></textarea>

      <div class="flux-row">
        <select id="flux-model">
          <option value="black-forest-labs/flux-schnell">Flux Schnell (fastest)</option>
          <option value="black-forest-labs/FLUX.1-krea-dev">Flux Dev (better quality)</option>
          <option value="black-forest-labs/flux-1.1-pro">Flux 1.1 Pro (best)</option>
        </select>
      </div>

      <div class="flux-row">
        <button class="flux-btn" id="flux-gen-btn">Generate</button>
      </div>

      <div class="flux-status" id="flux-status"></div>
      <div class="flux-spinner" id="flux-spinner"></div>

      <div class="flux-img-wrap" id="flux-gallery">
        <div class="flux-empty">Your generated images will appear here.</div>
      </div>
    </div>
  `;

  const promptEl  = tab.root.querySelector('#flux-prompt');
  const modelEl   = tab.root.querySelector('#flux-model');
  const genBtn    = tab.root.querySelector('#flux-gen-btn');
  const statusEl  = tab.root.querySelector('#flux-status');
  const spinnerEl = tab.root.querySelector('#flux-spinner');
  const gallery   = tab.root.querySelector('#flux-gallery');

  genBtn.addEventListener('click', async () => {
    const prompt = promptEl.value.trim();
    if (!prompt) {
      statusEl.textContent = '⚠️ Please enter a prompt first.';
      return;
    }

    genBtn.disabled = true;
    statusEl.textContent = '⏳ Loading generator…';
    spinnerEl.classList.add('active');

    try {
      const puter = await loadPuter();

      statusEl.textContent = '🎨 Generating image… (15–40 seconds)';

      const imgElement = await puter.ai.txt2img(prompt, {
        model: modelEl.value,
      });

      // Remove empty placeholder
      const emptyMsg = gallery.querySelector('.flux-empty');
      if (emptyMsg) emptyMsg.remove();

      const card = document.createElement('div');
      card.className = 'flux-img-card';

      const shortPrompt = prompt.length > 60 ? prompt.slice(0, 57) + '…' : prompt;

      // puter returns a real <img> element — style it and use it directly
      imgElement.style.width = '100%';
      imgElement.style.display = 'block';
      imgElement.style.borderRadius = '10px 10px 0 0';

      const footer = document.createElement('div');
      footer.className = 'flux-img-footer';

      const label = document.createElement('span');
      label.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      label.textContent = shortPrompt;

      // Build a save link from the img src
      const dlBtn = document.createElement('a');
      dlBtn.className = 'flux-dl';
      dlBtn.textContent = '⬇ Save';
      dlBtn.target = '_blank';
      dlBtn.href = imgElement.src;
      dlBtn.download = `flux-${Date.now()}.png`;

      footer.appendChild(label);
      footer.appendChild(dlBtn);
      card.appendChild(imgElement);
      card.appendChild(footer);
      gallery.insertBefore(card, gallery.firstChild);

      statusEl.textContent = '✅ Done!';
      setTimeout(() => { statusEl.textContent = ''; }, 3000);

    } catch (err) {
      statusEl.textContent = `❌ Error: ${err.message}`;
      console.error('[Flux Extension] Puter error:', err);
    } finally {
      spinnerEl.classList.remove('active');
      genBtn.disabled = false;
    }
  });

  promptEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) genBtn.click();
  });

  return () => { tab.destroy(); };
}
