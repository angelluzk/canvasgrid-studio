import { CanvasDrawPro } from './modules/canvasDrawPro.js';
import { PixelArtEditor } from './modules/pixelArtEditor.js';

document.addEventListener('DOMContentLoaded', () => {
    const canvasApp = new CanvasDrawPro();
    const pixelApp = new PixelArtEditor();

    let activeModule = 'canvas';

    const tabs = document.querySelectorAll('.nav-pill');
    const modules = document.querySelectorAll('.app-module');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const target = tab.dataset.target;
            activeModule = target === 'app-canvas-draw-pro' ? 'canvas' : 'pixel';

            modules.forEach(m => {
                if (m.id === target) {
                    m.classList.remove('hidden');
                    m.classList.add('flex');
                } else {
                    m.classList.add('hidden');
                    m.classList.remove('flex');
                }
            });
            window.dispatchEvent(new Event('resize'));
        });
    });

    const toggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    toggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        const icon = toggle.querySelector('svg');
        icon.setAttribute('data-lucide', html.classList.contains('dark') ? 'sun' : 'moon');
        if (window.lucide) window.lucide.createIcons();
    });

    if (window.lucide) window.lucide.createIcons();

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;

        const key = e.key.toLowerCase();
        const ctrl = e.ctrlKey || e.metaKey;

        if (activeModule === 'canvas') {
            canvasApp.handleShortcut(key, ctrl);
        } else {
            pixelApp.handleShortcut(key, ctrl);
        }
    });
});

(function __ui_enhancements__() {
    if (typeof window === 'undefined') return;

    function styleButtonIcons(btn) {
        if (!btn) return;
        const svg = btn.querySelector('svg');
        const iconEl = svg || btn.querySelector('i');
        if (iconEl && svg) {
            svg.setAttribute('focusable', 'false');
            svg.setAttribute('aria-hidden', 'true');
            svg.style.width = svg.style.width || '20px';
            svg.style.height = svg.style.height || '20px';
            svg.style.display = 'block';
            svg.style.margin = '0 auto';
        }
        btn.classList.add('ui-icon-animated');
    }

    function initialPass() {
        document.querySelectorAll('.tool-btn, .icon-btn, .icon-btn-small, .nav-pill, .btn-primary, .nav-pill .lucide').forEach(el => {
            styleButtonIcons(el);
        });
    }

    const observer = new MutationObserver(muts => {
        muts.forEach(m => {
            if (m.addedNodes && m.addedNodes.length) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        if (node.tagName && node.tagName.toLowerCase() === 'svg') {
                            const btn = node.closest('.tool-btn, .icon-btn, .icon-btn-small, .nav-pill, .btn-primary');
                            if (btn) styleButtonIcons(btn);
                        } else {
                            const svgs = node.querySelectorAll && node.querySelectorAll('svg');
                            if (svgs && svgs.length) {
                                svgs.forEach(sv => {
                                    const btn = sv.closest('.tool-btn, .icon-btn, .icon-btn-small, .nav-pill, .btn-primary');
                                    if (btn) styleButtonIcons(btn);
                                });
                            }
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', () => {
        setTimeout(initialPass, 120);
    });

    const origCreateIcons = window.lucide && window.lucide.createIcons;
    if (origCreateIcons && typeof origCreateIcons === 'function') {
        window.lucide.createIcons = function patchedCreateIcons() {
            const res = origCreateIcons.apply(this, arguments);
            setTimeout(() => {
                initialPass();
            }, 40);
            return res;
        };
    }

    document.addEventListener('mouseover', (e) => {
        const btn = e.target.closest('.btn-primary, .tool-btn, .icon-btn, .nav-pill');
        if (btn) btn.classList.add('ui-hovering');
    });
    document.addEventListener('mouseout', (e) => {
        const btn = e.target.closest('.btn-primary, .tool-btn, .icon-btn, .nav-pill');
        if (btn) btn.classList.remove('ui-hovering');
    });

    document.addEventListener('click', (e) => {
        if (e.target.closest && e.target.closest('#theme-toggle')) {
            setTimeout(() => { initialPass(); }, 80);
        }
    });

    window.__CanvasGridUI = { styleButtonIcons, initialPass, observer };
})();
