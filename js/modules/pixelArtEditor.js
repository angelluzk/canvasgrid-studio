/**
 * Módulo Pixel Art Editor
 */

// Estado (Model)
let gridSize = 16;
let activeColor = '#FF0000';
let activeTool = 'paint';
let gridState = []; 
let isMouseDown = false;
let transparencyColor = 'transparent';

// Elementos do DOM (Views)
let gridWrapper; 
let gridContainer; 
let gridElement; 
let toolButtons;
let paletteContainer;
let colorPicker;
let gridSizeSlider;
let gridSizeLabel;

// Paleta de Cores Base
const baseColors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008080', '#FFC0CB', '#A52A2A', '#808080'
];

export function initPixelArtEditor(wrapper, toolContainer) {
    console.log('Iniciando Pixel Art Editor...'); // Log de debug
    if (!wrapper || !toolContainer) {
        console.error('Containers não encontrados.');
        return;
    }
    
    gridWrapper = wrapper;

    // 1. Encontra os controles na UI
    gridSizeSlider = toolContainer.querySelector('#grid-size-slider');
    gridSizeLabel = toolContainer.querySelector('#grid-size-label');
    toolButtons = toolContainer.querySelectorAll('.tool-btn');
    paletteContainer = toolContainer.querySelector('#color-palette');
    colorPicker = toolContainer.querySelector('#color-picker');

    // 2. Configura os Listeners
    setupControlListeners();

    // 3. Renderiza a paleta
    renderPalette();
    updateActiveColor(baseColors[2]); // Vermelho

    // 4. Cria o grid
    createGrid();
}

function setupControlListeners() {
    // Mouse global
    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    // Slider
    gridSizeSlider.addEventListener('input', (e) => {
        gridSizeLabel.textContent = `${e.target.value}x${e.target.value}`;
    });
    gridSizeSlider.addEventListener('change', (e) => {
        gridSize = parseInt(e.target.value);
        createGrid();
    });

    // Ferramentas
    toolButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.dataset.tool === 'fillScreen') {
                fillScreen();
                return;
            }
            
            toolButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            activeTool = button.dataset.tool;
        });
    });

    // Cor Customizada
    colorPicker.addEventListener('input', (e) => updateActiveColor(e.target.value));
}

function createGrid() {
    gridWrapper.innerHTML = ''; 
    gridState = []; 

    // Container visual do grid (Borda e Fundo)
    gridContainer = document.createElement('div');
    gridContainer.id = 'pixel-grid-container';
    
    // Elemento Grid (CSS Grid)
    gridElement = document.createElement('div');
    gridElement.className = 'pixel-grid';
    if (gridSize > 32) gridElement.classList.add('dense'); // Remove bordas se for muito denso
    gridElement.style.setProperty('--grid-size', gridSize);
    
    // Geração das Células
    for (let y = 0; y < gridSize; y++) {
        const row = [];
        for (let x = 0; x < gridSize; x++) {
            row.push(transparencyColor);
            
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            gridElement.appendChild(cell);
        }
        gridState.push(row);
    }
    
    gridContainer.appendChild(gridElement);
    gridWrapper.appendChild(gridContainer);
    
    // Eventos do Grid
    gridElement.addEventListener('mousedown', handleGridClick);
    gridElement.addEventListener('mouseover', handleGridDrag);
    gridElement.addEventListener('dragstart', (e) => e.preventDefault());
}

function handleGridClick(e) {
    if (!e.target.classList.contains('grid-cell')) return;
    isMouseDown = true;
    const { x, y } = e.target.dataset;
    executeTool(parseInt(x), parseInt(y));
}

function handleGridDrag(e) {
    if (!isMouseDown || !e.target.classList.contains('grid-cell')) return;
    const { x, y } = e.target.dataset;
    // Apenas Paint e Erase funcionam arrastando
    if (activeTool === 'paint' || activeTool === 'erase') {
        executeTool(parseInt(x), parseInt(y));
    }
}

function executeTool(x, y) {
    switch (activeTool) {
        case 'paint':
            paintCell(x, y, activeColor);
            break;
        case 'erase':
            paintCell(x, y, transparencyColor);
            break;
        case 'fill':
            floodFill(x, y, gridState[y][x]);
            break;
        case 'pick':
            const picked = gridState[y][x];
            if (picked !== transparencyColor) {
                updateActiveColor(picked);
                colorPicker.value = picked; // Atualiza o input visualmente se for possível
            }
            break;
    }
}

function paintCell(x, y, color) {
    if (gridState[y][x] === color) return;
    gridState[y][x] = color;
    
    const cellIndex = gridSize * y + x;
    const cellElement = gridElement.children[cellIndex];
    if (cellElement) {
        cellElement.style.backgroundColor = color;
    }
}

function fillScreen() {
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            paintCell(x, y, activeColor);
        }
    }
}

function floodFill(startX, startY, targetColor) {
    const replacementColor = activeColor;
    if (targetColor === replacementColor) return;
    
    // Stack para algoritmo iterativo
    const stack = [[startX, startY]];

    while (stack.length > 0) {
        const [x, y] = stack.pop();

        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;

        if (gridState[y][x] === targetColor) {
            paintCell(x, y, replacementColor);
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
}

function renderPalette() {
    paletteContainer.innerHTML = '';
    baseColors.forEach(color => {
        const swatch = document.createElement('button');
        swatch.className = 'color-swatch';
        swatch.style.backgroundColor = color;
        swatch.addEventListener('click', () => updateActiveColor(color));
        paletteContainer.appendChild(swatch);
    });
}

function updateActiveColor(color) {
    activeColor = color;
    const swatches = paletteContainer.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
        // Conversão simples para comparação visual
        swatch.classList.toggle('active', swatch.style.backgroundColor === color || 
                                          rgbToHex(swatch.style.backgroundColor) === color);
    });
}

// Auxiliar simples para converter rgb() do navegador para hex (para comparação da paleta)
function rgbToHex(rgb) {
    if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return rgb;
    return "#" + ((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1).toUpperCase();
}