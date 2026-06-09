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
    description: 'Generate images with FLUX.1 Schnell via Hugging Face',
    keywords: ['image', 'flux', 'generate', 'art', 'picture', 'draw'],
    headerTitle: 'Image Generator',
    iconSvg: iconSvg,
  });

  tab.root.innerHTML = `
    <style>
      .flux-wrap {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
        overflow: hidden;
      }
      .flux-frame {
        flex: 1;
        width: 100%;
        border: none;
        border-radius: 8px;
        min-height: 0;
        background: #fff;
      }
      .flux-note {
        padding: 6px 10px;
        font-size: 11px;
        color: var(--color-text-muted, #a6adc8);
        text-align: center;
        flex-shrink: 0;
      }
    </style>
    <div class="flux-wrap">
      <iframe
        class="flux-frame"
        src="https://black-forest-labs-flux-1-schnell.hf.space"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
        title="FLUX.1 Schnell Image Generator"
      ></iframe>
      <div class="flux-note">Powered by FLUX.1 Schnell · Free · No login needed</div>
    </div>
  `;

  return () => { tab.destroy(); };
}
