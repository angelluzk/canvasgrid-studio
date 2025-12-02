export class CanvasDrawPro {
    constructor() {
        this.config = { width: 800, height: 600, bgColor: '#ffffff' };

        this.state = {
            brushColor: '#7f5af0',
            brushSize: 5,
            currentTool: 'brush',
            isDrawing: false,
            layers: [],
            activeLayerId: null,
            zoom: 1.0,
            history: [],
            historyIndex: -1,
            tempSnapshot: null
        };

        this.ui = {
            container: document.getElementById('canvas-container'),
            zoomWrapper: document.getElementById('canvas-zoom-wrapper'),
            layersList: document.getElementById('layers-list'),
            colorPicker: document.getElementById('canvas-color-picker'),
            brushSlider: document.getElementById('canvas-brush-size'),
            sizeLabel: document.getElementById('canvas-size-label'),
            toolsPanel: document.getElementById('canvas-tools-panel'),
            btnAddLayer: document.getElementById('btn-add-layer'),
            btnDelLayer: document.getElementById('btn-delete-layer'),
            btnDownload: document.getElementById('btn-canvas-export'),
            btnZoomIn: document.getElementById('btn-canvas-zoom-in'),
            btnZoomOut: document.getElementById('btn-canvas-zoom-out'),
            zoomDisplay: document.getElementById('canvas-zoom-display'),
            status: document.getElementById('canvas-status'),
            btnUndo: document.getElementById('btn-canvas-undo'),
            btnRedo: document.getElementById('btn-canvas-redo')
        };

        this.init();
    }

    init() {
        if (!this.ui.container) return;

        this.ui.container.style.width = `${this.config.width}px`;
        this.ui.container.style.height = `${this.config.height}px`;
        this.ui.container.style.position = 'relative';

        this.bindEvents();
        this.addLayer('Fundo');
        this.updateStatus('Pronto para desenhar');
    }

    bindEvents() {
        this.ui.colorPicker.addEventListener('input', (e) => {
            this.state.brushColor = e.target.value;
            e.target.parentElement.style.borderColor = e.target.value;
        });

        this.ui.brushSlider.addEventListener('input', (e) => {
            this.state.brushSize = parseInt(e.target.value);
            this.ui.sizeLabel.textContent = `${this.state.brushSize}px`;
            this.updateStatus(`Tamanho: ${this.state.brushSize}px`);
        });

        this.ui.toolsPanel.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (!btn) return;
            this.setTool(btn.dataset.tool);
        });

        this.ui.btnAddLayer.addEventListener('click', () => this.addLayer());
        this.ui.btnDelLayer.addEventListener('click', () => this.deleteActiveLayer());
        this.ui.btnDownload.addEventListener('click', () => this.exportCanvas());

        this.ui.btnZoomIn.addEventListener('click', () => this.setZoom(0.1));
        this.ui.btnZoomOut.addEventListener('click', () => this.setZoom(-0.1));
        this.ui.zoomWrapper.addEventListener('wheel', (e) => {
            if (e.ctrlKey) { e.preventDefault(); this.setZoom(e.deltaY > 0 ? -0.1 : 0.1); }
        });

        if (this.ui.btnUndo) this.ui.btnUndo.addEventListener('click', () => this.undo());
        if (this.ui.btnRedo) this.ui.btnRedo.addEventListener('click', () => this.redo());
    }
    handleShortcut(key, ctrl) {
        if (ctrl && key === 'z') return this.undo();
        if (ctrl && key === 'y') return this.redo();

        switch (key) {
            case 'b': this.setTool('brush'); break;
            case 'e': this.setTool('eraser'); break;
            case 'f': case 'g': this.setTool('fill'); break;
            case 'i': this.setTool('pick'); break;
            case '[': this.changeSize(-2); break;
            case ']': this.changeSize(2); break;
        }
    }

    setTool(tool) {
        this.state.currentTool = tool;
        this.ui.toolsPanel.querySelectorAll('.tool-btn').forEach(b => {
            if (b.dataset.tool === tool) b.classList.add('active');
            else b.classList.remove('active');
        });
        this.updateCursor();
        this.updateStatus(`Ferramenta: ${tool.toUpperCase()}`);
    }

    changeSize(delta) {
        const newSize = Math.max(1, Math.min(100, this.state.brushSize + delta));
        this.state.brushSize = newSize;
        this.ui.brushSlider.value = newSize;
        this.ui.sizeLabel.textContent = `${newSize}px`;
        this.updateStatus(`Tamanho: ${newSize}px`);
    }

    setZoom(delta) {
        this.state.zoom = Math.max(0.1, Math.min(this.state.zoom + delta, 5.0));
        this.ui.container.style.transform = `scale(${this.state.zoom})`;
        this.ui.zoomDisplay.textContent = `${Math.round(this.state.zoom * 100)}%`;
    }

    updateStatus(msg) {
        if (this.ui.status) {
            this.ui.status.textContent = msg;
            this.ui.status.style.opacity = '1';
            setTimeout(() => this.ui.status.style.opacity = '0.7', 2000);
        }
    }

    updateCursor() {
        this.ui.container.className = `bg-white shadow-2xl transition-shadow cursor-${this.state.currentTool}`;
    }

    captureLayerState(layerId) {
        const layer = this.state.layers.find(l => l.id === layerId);
        if (!layer) return null;
        return layer.ctx.getImageData(0, 0, layer.canvas.width, layer.canvas.height);
    }

    startAction() {
        const layer = this.getActiveLayer();
        if (!layer) return;
        this.state.tempSnapshot = this.captureLayerState(layer.id);
    }

    endAction() {
        const layer = this.getActiveLayer();
        if (!layer || !this.state.tempSnapshot) return;

        const finalSnapshot = this.captureLayerState(layer.id);

        if (this.state.historyIndex < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyIndex + 1);
        }

        this.state.history.push({
            layerId: layer.id,
            before: this.state.tempSnapshot,
            after: finalSnapshot
        });

        this.state.historyIndex++;

        if (this.state.history.length > 30) {
            this.state.history.shift();
            this.state.historyIndex--;
        }

        this.state.tempSnapshot = null;
    }

    undo() {
        if (this.state.historyIndex < 0) return;

        const action = this.state.history[this.state.historyIndex];
        this.restoreLayerPixels(action.layerId, action.before);

        this.state.historyIndex--;
        this.updateStatus('Desfazer');
    }

    redo() {
        if (this.state.historyIndex >= this.state.history.length - 1) return;

        this.state.historyIndex++;
        const action = this.state.history[this.state.historyIndex];

        this.restoreLayerPixels(action.layerId, action.after);
        this.updateStatus('Refazer');
    }

    restoreLayerPixels(layerId, imageData) {
        const layer = this.state.layers.find(l => l.id === layerId);
        if (layer && imageData) {
            layer.ctx.putImageData(imageData, 0, 0);
            if (this.state.activeLayerId !== layerId) {
                this.setActiveLayer(layerId);
            }
        }
    }

    addLayer(name = null) {
        const id = Date.now();
        const canvas = document.createElement('canvas');
        canvas.id = `layer-${id}`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0'; canvas.style.left = '0';

        const dpr = window.devicePixelRatio || 1;
        canvas.width = this.config.width * dpr;
        canvas.height = this.config.height * dpr;
        canvas.style.width = '100%'; canvas.style.height = '100%';

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.state.layers.length === 0) {
            ctx.fillStyle = this.config.bgColor;
            ctx.fillRect(0, 0, this.config.width, this.config.height);
        }

        this.ui.container.appendChild(canvas);
        const layerObj = { id, name: name || `Camada ${this.state.layers.length + 1}`, canvas, ctx, visible: true };
        this.state.layers.push(layerObj);

        this.setupDrawingEvents(canvas);
        this.setActiveLayer(id);
    }

    setActiveLayer(id) {
        this.state.activeLayerId = id;
        this.state.layers.forEach(l => l.canvas.style.pointerEvents = l.id === id ? 'auto' : 'none');
        this.renderLayersList();
    }

    deleteActiveLayer() {
        if (this.state.layers.length <= 1) {
            this.updateStatus('Impossível apagar a última camada');
            return;
        }

        const index = this.state.layers.findIndex(l => l.id === this.state.activeLayerId);
        if (index > -1) {
            this.state.layers[index].canvas.remove();
            this.state.layers.splice(index, 1);
            this.setActiveLayer(this.state.layers[Math.max(0, index - 1)].id);
        }
    }

    renderLayersList() {
        this.ui.layersList.innerHTML = '';
        [...this.state.layers].reverse().forEach(layer => {
            const item = document.createElement('div');
            const isActive = layer.id === this.state.activeLayerId;
            item.className = `layer-item ${isActive ? 'active' : ''}`;
            item.onclick = () => this.setActiveLayer(layer.id);

            item.innerHTML = `
                <span class="flex-grow font-medium text-sm">${layer.name}</span>
                ${isActive ? '<div class="w-2 h-2 rounded-full bg-studio-primary"></div>' : ''}
            `;
            this.ui.layersList.appendChild(item);
        });
    }

    setupDrawingEvents(canvas) {
        const getPos = (e) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: (e.clientX - rect.left) / this.state.zoom,
                y: (e.clientY - rect.top) / this.state.zoom
            };
        };

        const start = (e) => {
            if (this.state.currentTool === 'fill') {
                this.startAction();
                this.floodFill();
                this.endAction();
                return;
            }
            if (this.state.currentTool === 'pick') {
                return this.pickColor(getPos(e));
            }

            this.state.isDrawing = true;
            this.startAction();
            this.draw(getPos(e));
        };

        const move = (e) => {
            if (this.state.isDrawing) this.draw(getPos(e));
        };

        const end = () => {
            if (this.state.isDrawing) {
                this.state.isDrawing = false;
                const layer = this.getActiveLayer();
                if (layer) layer.ctx.beginPath();

                this.endAction();
            }
        };

        canvas.addEventListener('mousedown', start);
        canvas.addEventListener('mousemove', move);
        canvas.addEventListener('mouseup', end);
        canvas.addEventListener('mouseout', end);
    }

    draw(pos) {
        const layer = this.getActiveLayer();
        if (!layer) return;
        const ctx = layer.ctx;

        ctx.lineWidth = this.state.brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.state.currentTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = this.state.brushColor;
            ctx.shadowBlur = 0.5;
            ctx.shadowColor = this.state.brushColor;
        }

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        ctx.shadowBlur = 0;
    }

    pickColor(pos) {
        const ctx = this.getActiveLayer().ctx;
        const p = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const hex = "#" + ((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1);

        this.state.brushColor = hex;
        this.ui.colorPicker.value = hex;
        this.setTool('brush');
        this.updateStatus(`Cor selecionada: ${hex}`);
    }

    floodFill() {
        const ctx = this.getActiveLayer().ctx;
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = this.state.brushColor;
        ctx.fillRect(0, 0, this.config.width, this.config.height);
        this.updateStatus("Camada preenchida");
    }

    getActiveLayer() {
        return this.state.layers.find(l => l.id === this.state.activeLayerId);
    }

    exportCanvas() {
        const temp = document.createElement('canvas');
        const dpr = window.devicePixelRatio || 1;
        temp.width = this.config.width * dpr;
        temp.height = this.config.height * dpr;

        const ctx = temp.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, temp.width, temp.height);

        this.state.layers.forEach(l => {
            if (l.visible) ctx.drawImage(l.canvas, 0, 0);
        });

        const link = document.createElement('a');
        link.download = `art-${Date.now()}.png`;
        link.href = temp.toDataURL();
        link.click();
    }
}