/* <image-slot> — framed image with a placeholder state and an attribution chip.
   Production counterpart of the design tool's image-slot starter (which was read-only
   outside the design runtime). Attributes: src, placeholder, shape (rect|circle),
   credit, credit-href, initials (shown in the empty state instead of the icon), focus (inline style framing the image),
   busy (shimmer while the caller is still looking for an image). */
const css = `
:host{display:block;position:relative;width:100%;height:100%;color:inherit;font:13px/1.3 var(--mono,ui-monospace),monospace}
.frame{position:absolute;inset:0;overflow:hidden;background:var(--paper2,#221d17)}
:host([shape=circle]) .frame{border-radius:50%}
img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:50% 25%;display:block;opacity:0;filter:blur(14px) saturate(.6);scale:1.06;
  transition:opacity .45s ease-out,filter .8s cubic-bezier(.2,.8,.2,1),scale 1.2s cubic-bezier(.2,.8,.2,1)}
:host([data-filled]) img{opacity:1;filter:none;scale:1}
.empty::after{content:"";position:absolute;inset:0;opacity:0;transition:opacity .3s;background:linear-gradient(100deg,transparent 30%,rgba(239,224,191,.13) 50%,transparent 70%) 0 0/250% 100%;animation:sh 1.3s linear infinite}
:host([busy]) .empty::after,:host([src]:not([src=""]):not([data-filled])) .empty::after{opacity:1}
@keyframes sh{from{background-position:130% 0}to{background-position:-30% 0}}
@media (prefers-reduced-motion:reduce){img{transition:opacity .2s;filter:none;scale:1}.empty::after{animation:none}}
.empty{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:12px;
  background:repeating-linear-gradient(45deg,var(--paper3,#3a3127) 0 6px,var(--paper2,#221d17) 6px 12px);color:var(--ink3,#8d7c5e);
  font-size:10px;letter-spacing:.08em;text-transform:uppercase}
.empty svg{opacity:.6}
.ini{font:700 30px var(--disp,sans-serif);letter-spacing:.02em;color:var(--ink,#efe0bf);text-transform:none}
:host([shape=circle]) .cap{display:none}
:host([data-filled]) .empty{display:none}
.credit{position:absolute;left:6px;bottom:6px;max-width:calc(100% - 12px);display:none;padding:3px 7px;border-radius:5px;background:rgba(0,0,0,.55);
  color:#fff;font:10px/1.2 system-ui,-apple-system,sans-serif;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
:host([data-filled][credit]:not([shape=circle])) .credit{display:block}
`;
const icon = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/></svg>';

class ImageSlot extends HTMLElement {
  static observedAttributes = ['src', 'placeholder', 'credit', 'credit-href', 'initials', 'focus'];
  private root: ShadowRoot;
  private img!: HTMLImageElement;
  private loaded = '';

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
    this.root.innerHTML = `<style>${css}</style><div class="frame" part="frame"><img alt="" draggable="false"><div class="empty"><span class="mark"></span><span class="cap"></span></div></div><a class="credit" target="_blank" rel="noopener"></a>`;
    this.img = this.root.querySelector('img')!;
    this.img.addEventListener('load', () => { if (this.img.naturalWidth > 1) this.toggleAttribute('data-filled', true); });
    // A broken image never shows; the hatched placeholder stays.
    this.img.addEventListener('error', () => this.removeAttribute('data-filled'));
  }

  connectedCallback(): void { this.render(); }
  attributeChangedCallback(): void { this.render(); }

  private render(): void {
    const ini = this.getAttribute('initials');
    this.root.querySelector('.mark')!.innerHTML = ini ? `<span class="ini">${ini.replace(/[<&]/g, '')}</span>` : icon;
    this.root.querySelector('.cap')!.textContent = this.getAttribute('placeholder') || '';
    const src = this.getAttribute('src') || '';
    if (src !== this.loaded) {
      this.loaded = src;
      this.removeAttribute('data-filled');
      if (src) this.img.src = src; else this.img.removeAttribute('src');
    }
    this.img.style.cssText = this.getAttribute('focus') || '';
    const a = this.root.querySelector<HTMLAnchorElement>('.credit')!;
    a.textContent = this.getAttribute('credit') || '';
    const href = this.getAttribute('credit-href') || '';
    if (/^https?:\/\//.test(href)) a.href = href; else a.removeAttribute('href');
  }
}

if (!customElements.get('image-slot')) customElements.define('image-slot', ImageSlot);
