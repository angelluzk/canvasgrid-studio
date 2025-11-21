import { initCanvasDrawPro } from './modules/canvasDrawPro.js';
import { initPixelArtEditor } from './modules/pixelArtEditor.js';

document.addEventListener('DOMContentLoaded', () => {

    const tabs = document.querySelectorAll('.tab-btn');
    const modules = document.querySelectorAll('.app-module');
    const activeTabClasses = ['text-cyan-500', 'dark:text-cyan-400', 'border-cyan-500', 'dark:border-cyan-400'];
    const inactiveTabClasses = ['text-gray-500', 'dark:text-gray-400', 'border-transparent', 'hover:text-cyan-500', 'dark:hover:text-white', 'hover:border-cyan-500'];

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            tabs.forEach(t => {
                if (t === tab) {
                    t.classList.remove(...inactiveTabClasses);
                    t.classList.add(...activeTabClasses);
                } else {
                    t.classList.remove(...activeTabClasses);
                    t.classList.add(...inactiveTabClasses);
                }
            });

            modules.forEach(module => {
                module.classList.toggle('hidden', module.id !== targetId);
            });

            window.dispatchEvent(new Event('resize'));
        });
    });

    const themeToggle = document.getElementById('theme-toggle');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const html = document.documentElement;

    function updateThemeIcon() {
        if (html.classList.contains('dark')) {
            themeIconLight.classList.remove('hidden');
            themeIconDark.classList.add('hidden');
        } else {
            themeIconLight.classList.add('hidden');
            themeIconDark.classList.remove('hidden');
        }
    }

    themeToggle.addEventListener('click', () => {
        html.classList.toggle('dark');
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else if (savedTheme === 'dark') {
        html.classList.add('dark');
    }
    updateThemeIcon();

    initPixelArtEditor(
        document.getElementById('pixel-editor-wrapper'),
        document.getElementById('pixel-art-tools')
    );

    initCanvasDrawPro(document.getElementById('app-canvas-draw-pro'));

});