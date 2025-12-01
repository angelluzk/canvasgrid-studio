let width = 800;
let height = 600;
let brushColor = '#000000';
let brushSize = 5;
let currentTool = 'brush';
let isDrawing = false;
let layers = [];
let activeLayerId = null;

let container;
let layersListEl;
let colorPicker;
let brushSizeInput;
let toolsBtns;

export function initCanvasDrawPro(wrapper) {
    if (!document.getElementById('canvas-container')) return;

    console.log("Iniciando Canvas Draw Pro Engine...");

    container = document.getElementById('canvas-container');
    layersListEl = document.getElementById('layers-list');
    colorPicker = document.getElementById('canvas-color-picker');
    brushSizeInput = document.getElementById('brush-size');
    toolsBtns = document.querySelectorAll('.canvas-tool-btn');

    setupUI();

    if (layers.length === 0) {
        addLayer('Fundo');
    }
}

function setupUI() {
    colorPicker.addEventListener('input', (e) => brushColor = e.target.value);

    brushSizeInput.addEventListener('input', (e) => brushSize = e.target.value);

    toolsBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toolsBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTool = btn.dataset.tool;
        });
    });

    document.getElementById('btn-add-layer').addEventListener('click', () => addLayer());
    document.getElementById('btn-delete-layer').addEventListener('click', deleteActiveLayer);
    document.getElementById('btn-download-canvas').addEventListener('click', exportCanvas);
}

function addLayer(name = null) {
    const id = Date.now();
    const layerName = name || `Camada ${layers.length + 1}`;

    const canvas = document.createElement('canvas');
    canvas.classList.add('drawing-layer');
    canvas.id = `layer-${id}`;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    container.appendChild(canvas);
    
    const layerObj = { id, name: layerName, canvas, ctx, visible: true };
    layers.push(layerObj);

    setupCanvasEvents(canvas);

    setActiveLayer(id);
    renderLayersList();
}

function setActiveLayer(id) {
    activeLayerId = id;

    layers.forEach(l => {
        if (l.id === id) {
            l.canvas.classList.add('active-layer-canvas');
        } else {
            l.canvas.classList.remove('active-layer-canvas');
        }
    });

    renderLayersList();
}

function renderLayersList() {
    layersListEl.innerHTML = '';

    [...layers].reverse().forEach(layer => {
        const item = document.createElement('div');
        item.className = `layer-item ${layer.id === activeLayerId ? 'active' : ''}`;
        item.onclick = () => setActiveLayer(layer.id);
        
        item.innerHTML = `
            <div class="layer-preview"></div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-200">${layer.name}</span>
        `;
        
        layersListEl.appendChild(item);
    });
}

function setupCanvasEvents(canvas) {
    const startDraw = (e) => {
        isDrawing = true;
        draw(e);
    };
    
    const stopDraw = () => {
        isDrawing = false;
        const layer = layers.find(l => l.id === activeLayerId);
        if(layer) layer.ctx.beginPath();
    };
    
    const draw = (e) => {
        if (!isDrawing) return;
        const layer = layers.find(l => l.id === activeLayerId);
        if (!layer) return;

        const ctx = layer.ctx;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = brushSize;
        if (currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
        }

        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);
}

function deleteActiveLayer() {
    if (layers.length <= 1) return;
    
    const index = layers.findIndex(l => l.id === activeLayerId);
    if (index > -1) {
        const layer = layers[index];
        layer.canvas.remove();
        layers.splice(index, 1);

        const nextId = layers[Math.max(0, index - 1)].id;
        setActiveLayer(nextId);
    }
}

function exportCanvas() {
    const tempCanvas = document.createElement('canvas');
    const dpr = window.devicePixelRatio || 1;
    tempCanvas.width = width * dpr;
    tempCanvas.height = height * dpr;
    const tempCtx = tempCanvas.getContext('2d');

    layers.forEach(layer => {
        if (layer.visible) {
            tempCtx.drawImage(layer.canvas, 0, 0);
        }
    });
    
    const link = document.createElement('a');
    link.download = 'canvas-art.png';
    link.href = tempCanvas.toDataURL();
    link.click();
}