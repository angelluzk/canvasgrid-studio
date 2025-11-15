// Importa os módulos
import { initCanvasDrawPro } from './modules/canvasDrawPro.js';
import { initPixelArtEditor } from './modules/pixelArtEditor.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Gerenciamento de Abas ---
    const tabs = document.querySelectorAll('.tab-btn');
    const modules = document.querySelectorAll('.app-module');
    
    // Classes de estilo para a aba
    const activeTabClasses = ['text-cyan-500', 'dark:text-cyan-400', 'border-cyan-500', 'dark:border-cyan-400'];
    const inactiveTabClasses = ['text-gray-500', 'dark:text-gray-400', 'border-transparent', 'hover:text-cyan-500', 'dark:hover:text-white', 'hover:border-cyan-500'];

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.getAttribute('data-target');

            // 1. Atualiza Abas
            tabs.forEach(t => {
                if (t === tab) {
                    t.classList.remove(...inactiveTabClasses);
                    t.classList.add(...activeTabClasses);
                } else {
                    t.classList.remove(...activeTabClasses);
                    t.classList.add(...inactiveTabClasses);
                }
            });

            // 2. Alterna Módulos
            modules.forEach(module => {
                module.classList.toggle('hidden', module.id !== targetId);
            });
            
            // 3. Dispara evento de redimensionamento (útil para o canvas)
            window.dispatchEvent(new Event('resize'));
        });
    });

    // --- Gerenciamento de Tema (Light/Dark) ---
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
        // Salva a preferência (opcional, mas bom para UX)
        localStorage.setItem('theme', html.classList.contains('dark') ? 'dark' : 'light');
        updateThemeIcon();
    });

    // Verifica tema salvo ou preferência do sistema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        html.classList.remove('dark');
    } else if (savedTheme === 'dark') {
        html.classList.add('dark');
    }
    // Garante que o ícone correto seja exibido no carregamento
    updateThemeIcon();


    // --- Inicialização dos Módulos ---
    
    // Passamos o container real onde o editor deve ser renderizado
    initPixelArtEditor(
        document.getElementById('pixel-editor-wrapper'),
        document.getElementById('pixel-art-tools')
    );
    
    // Placeholder para o Canvas Pro
    initCanvasDrawPro(document.getElementById('app-canvas-draw-pro'));

});