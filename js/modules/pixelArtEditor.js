let gridSize = 16;
let activeColor = '#FF0000';
let activeTool = 'paint';
let gridState = []; 
let isMouseDown = false;
let transparencyColor = 'transparent';

let zoomLevel = 1.0;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5.0;

let gridWrapper;
let gridContainer;
let gridElement;
let loadingText;
let toolButtons;
let paletteContainer;
let colorPicker;
let gridSizeSlider;
let gridSizeLabel;
let btnExportPng;
let btnZoomIn;
let btnZoomOut;
let zoomDisplay;

const baseColors = [
    '#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
    '#FFA500', '#800080', '#008080', '#FFC0CB', '#A52A2A', '#808080', '#36454F', '#D3D3D3'
];

export function initPixelArtEditor(wrapper, toolContainer) {
    if (!wrapper || !toolContainer) {
        console.error('Containers não encontrados.');
        return;
    }

    gridWrapper = wrapper.querySelector('#zoom-container');
    loadingText = wrapper.querySelector('#loading-text');

    gridSizeSlider = toolContainer.querySelector('#grid-size-slider');
    gridSizeLabel = toolContainer.querySelector('#grid-size-label');
    toolButtons = toolContainer.querySelectorAll('.tool-btn');
    paletteContainer = toolContainer.querySelector('#color-palette');
    colorPicker = toolContainer.querySelector('#color-picker');

    btnExportPng = toolContainer.querySelector('#btn-export-png');
    btnZoomIn = toolContainer.querySelector('#btn-zoom-in');
    btnZoomOut = toolContainer.querySelector('#btn-zoom-out');
    zoomDisplay = toolContainer.querySelector('#zoom-display');

    setupControlListeners();
    renderPalette();
    updateActiveColor(baseColors[2]); 
    createGrid();

    if(loadingText) loadingText.classList.add('hidden');
}

function setupControlListeners() {
    window.addEventListener('mousedown', () => { isMouseDown = true; });
    window.addEventListener('mouseup', () => { isMouseDown = false; });

    gridSizeSlider.addEventListener('input', (e) => {
        gridSizeLabel.textContent = `${e.target.value}x${e.target.value}`;
    });
    gridSizeSlider.addEventListener('change', (e) => {
        gridSize = parseInt(e.target.value);
        createGrid();
    });

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

    colorPicker.addEventListener('input', (e) => updateActiveColor(e.target.value));

    btnExportPng.addEventListener('click', exportPNG);

    btnZoomIn.addEventListener('click', () => updateZoom(0.1));
    btnZoomOut.addEventListener('click', () => updateZoom(-0.1));

    gridWrapper.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            updateZoom(delta);
        }
    });
}

function updateZoom(delta) {
    zoomLevel += delta;
    zoomLevel = Math.min(Math.max(zoomLevel, MIN_ZOOM), MAX_ZOOM);

    zoomDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;

    if (gridContainer) {
        gridContainer.style.transform = `scale(${zoomLevel})`;
        gridContainer.style.transformOrigin = 'center top';
        gridContainer.style.marginTop = zoomLevel > 1 ? `${(zoomLevel - 1) * 50}px` : '0';
    }
}

function createGrid() {
    gridWrapper.innerHTML = ''; 
    gridState = []; 

    gridContainer = document.createElement('div');
    gridContainer.id = 'pixel-grid-container';
    gridContainer.style.transform = `scale(${zoomLevel})`;
    gridContainer.style.transformOrigin = 'center top';
    
    gridElement = document.createElement('div');
    gridElement.className = 'pixel-grid';
    if (gridSize > 32) gridElement.classList.add('dense');
    gridElement.style.setProperty('--grid-size', gridSize);
    
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
    if (activeTool === 'paint' || activeTool === 'erase') {
        executeTool(parseInt(x), parseInt(y));
    }
}

function executeTool(x, y) {
    switch (activeTool) {
        case 'paint': paintCell(x, y, activeColor); break;
        case 'erase': paintCell(x, y, transparencyColor); break;
        case 'fill': floodFill(x, y, gridState[y][x]); break;
        case 'pick':
            const picked = gridState[y][x];
            if (picked !== transparencyColor) {
                updateActiveColor(picked);
                colorPicker.value = picked;
            }
            break;
    }
}

function paintCell(x, y, color) {
    if (gridState[y][x] === color) return;
    gridState[y][x] = color;
    const cellElement = gridElement.children[gridSize * y + x];
    if (cellElement) cellElement.style.backgroundColor = color;
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
        swatch.classList.toggle('active', swatch.style.backgroundColor === color || rgbToHex(swatch.style.backgroundColor) === color);
    });
}

function rgbToHex(rgb) {
    if (!rgb || rgb.indexOf('rgb') === -1) return rgb;
    const rgbValues = rgb.match(/\d+/g);
    if (!rgbValues) return rgb;
    return "#" + ((1 << 24) + (parseInt(rgbValues[0]) << 16) + (parseInt(rgbValues[1]) << 8) + parseInt(rgbValues[2])).toString(16).slice(1).toUpperCase();
}

function exportPNG() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const scale = 10; 
    canvas.width = gridSize * scale;
    canvas.height = gridSize * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const color = gridState[y][x];
            if (color !== 'transparent') {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    const link = document.createElement('a');
    link.download = `pixelart-${new Date().getTime()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}