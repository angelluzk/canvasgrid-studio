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