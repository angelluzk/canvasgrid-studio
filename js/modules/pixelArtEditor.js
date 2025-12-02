export class PixelArtEditor {
    constructor() {
        this.state = {
            gridSize: 16, activeColor: '#7f5af0', activeTool: 'paint',
            isMouseDown: false, zoom: 1.0, gridData: [],
            history: [], historyStep: -1
        };
        this.ui = {
            wrapper: document.getElementById('pixel-zoom-wrapper'),
            toolsPanel: document.getElementById('pixel-tools-panel'),
            slider: document.getElementById('pixel-grid-slider'),
            label: document.getElementById('pixel-grid-label'),
            colorPicker: document.getElementById('pixel-color-picker'),
            palette: document.getElementById('pixel-palette'),
            btnZoomIn: document.getElementById('btn-pixel-zoom-in'),
            btnZoomOut: document.getElementById('btn-pixel-zoom-out'),
            zoomDisplay: document.getElementById('pixel-zoom-display'),
            btnExport: document.getElementById('btn-pixel-export'),
            btnUndo: document.getElementById('btn-pixel-undo'),
            btnRedo: document.getElementById('btn-pixel-redo'),
            status: document.getElementById('pixel-status')
        };
        this.CONSTANTS = { TRANSPARENT: 'transparent', COLORS: ['#ffffff', '#000000', '#7f5af0', '#2cb67d', '#ff0055', '#ffbe0b', '#3a86ff'] };
        this.init();
    }

    init() {
        if (!this.ui.wrapper) return;
        this.bindEvents();
        this.renderPalette();
        this.createGrid();
        this.saveState();
    }

    bindEvents() {
        window.addEventListener('mousedown', () => this.state.isMouseDown = true);
        window.addEventListener('mouseup', () => {
            if (this.state.isMouseDown) {
                this.state.isMouseDown = false;
                this.saveState();
            }
        });

        this.ui.slider.addEventListener('change', (e) => { this.state.gridSize = parseInt(e.target.value); this.createGrid(); this.saveState(); });
        this.ui.slider.addEventListener('input', (e) => this.ui.label.textContent = `${e.target.value}x${e.target.value}`);
        this.ui.colorPicker.addEventListener('input', (e) => this.setActiveColor(e.target.value));

        this.ui.btnZoomIn.addEventListener('click', () => this.setZoom(0.1));
        this.ui.btnZoomOut.addEventListener('click', () => this.setZoom(-0.1));
        this.ui.btnExport.addEventListener('click', () => this.exportPNG());

        this.ui.btnUndo.addEventListener('click', () => this.undo());
        this.ui.btnRedo.addEventListener('click', () => this.redo());

        this.ui.toolsPanel.addEventListener('click', (e) => {
            const btn = e.target.closest('.tool-btn');
            if (!btn) return;
            const tool = btn.dataset.tool;
            if (tool === 'fillScreen') { this.fillScreen(); this.saveState(); }
            else this.setTool(tool);
        });
    }

    handleShortcut(key, ctrl) {
        if (ctrl && key === 'z') return this.undo();
        if (ctrl && key === 'y') return this.redo();
        switch (key) {
            case 'b': this.setTool('paint'); break;
            case 'e': this.setTool('erase'); break;
            case 'f': case 'g': this.setTool('fill'); break;
            case 'i': this.setTool('pick'); break;
        }
    }

    saveState() {
        const currentState = JSON.stringify(this.state.gridData);

        if (this.state.historyStep >= 0 && this.state.history[this.state.historyStep] === currentState) return;

        if (this.state.historyStep < this.state.history.length - 1) {
            this.state.history = this.state.history.slice(0, this.state.historyStep + 1);
        }

        this.state.history.push(currentState);
        this.state.historyStep++;

        if (this.state.history.length > 30) {
            this.state.history.shift();
            this.state.historyStep--;
        }
    }

    undo() {
        if (this.state.historyStep > 0) {
            this.state.historyStep--;
            this.restoreState();
            this.updateStatus('Desfazer');
        }
    }

    redo() {
        if (this.state.historyStep < this.state.history.length - 1) {
            this.state.historyStep++;
            this.restoreState();
            this.updateStatus('Refazer');
        }
    }

    restoreState() {
        const data = JSON.parse(this.state.history[this.state.historyStep]);
        this.state.gridData = data;
        for (let y = 0; y < this.state.gridSize; y++) {
            for (let x = 0; x < this.state.gridSize; x++) {
                const color = data[y][x];
                const cell = this.ui.gridContainer.children[(this.state.gridSize * y) + x];
                if (cell) cell.style.backgroundColor = color;
            }
        }
    }

    createGrid() {
        this.ui.wrapper.innerHTML = '';
        this.state.gridData = [];
        const container = document.createElement('div');
        container.id = 'pixel-grid-container';
        container.style.width = '500px'; container.style.height = '500px';
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${this.state.gridSize}, 1fr)`;
        container.style.transform = `scale(${this.state.zoom})`;
        container.style.transformOrigin = 'center top';

        for (let y = 0; y < this.state.gridSize; y++) {
            const row = [];
            for (let x = 0; x < this.state.gridSize; x++) {
                row.push(this.CONSTANTS.TRANSPARENT);
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                if (this.state.gridSize <= 32) cell.style.border = '1px solid rgba(128,128,128,0.1)';
                cell.dataset.x = x; cell.dataset.y = y;
                container.appendChild(cell);
            }
            this.state.gridData.push(row);
        }

        container.addEventListener('mousedown', (e) => this.handleInteract(e));
        container.addEventListener('mouseover', (e) => { if (this.state.isMouseDown) this.handleInteract(e); });
        container.addEventListener('dragstart', (e) => e.preventDefault());

        this.ui.gridContainer = container;
        this.ui.wrapper.appendChild(container);
    }

    handleInteract(e) {
        if (!e.target.dataset.x) return;
        this.executeTool(parseInt(e.target.dataset.x), parseInt(e.target.dataset.y));
    }

    executeTool(x, y) {
        switch (this.state.activeTool) {
            case 'paint': this.paint(x, y, this.state.activeColor); break;
            case 'erase': this.paint(x, y, this.CONSTANTS.TRANSPARENT); break;
            case 'fill': this.floodFill(x, y, this.state.gridData[y][x]); break;
            case 'pick': this.setActiveColor(this.state.gridData[y][x]); this.ui.colorPicker.value = this.state.activeColor; break;
        }
    }

    paint(x, y, color) {
        if (this.state.gridData[y][x] === color) return;
        this.state.gridData[y][x] = color;
        this.ui.gridContainer.children[(this.state.gridSize * y) + x].style.backgroundColor = color;
    }

    fillScreen() {
        for (let y = 0; y < this.state.gridSize; y++) for (let x = 0; x < this.state.gridSize; x++) this.paint(x, y, this.state.activeColor);
    }

    floodFill(sx, sy, tColor) {
        const rColor = this.state.activeColor;
        if (tColor === rColor) return;
        const stack = [[sx, sy]];
        while (stack.length) {
            const [x, y] = stack.pop();
            if (x < 0 || x >= this.state.gridSize || y < 0 || y >= this.state.gridSize) continue;
            if (this.state.gridData[y][x] === tColor) {
                this.paint(x, y, rColor);
                stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
            }
        }
        this.saveState();
    }

    setTool(tool) {
        this.state.activeTool = tool;
        this.ui.toolsPanel.querySelectorAll('.tool-btn').forEach(b => {
            if (b.dataset.tool === tool) b.classList.add('active');
            else b.classList.remove('active');
        });
        this.updateStatus(`Ferramenta: ${tool.toUpperCase()}`);
    }

    setActiveColor(color) {
        this.state.activeColor = color;
        this.ui.palette.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('active', s.style.backgroundColor === color));
    }

    setZoom(delta) {
        this.state.zoom = Math.max(0.5, Math.min(this.state.zoom + delta, 5.0));
        if (this.ui.gridContainer) {
            this.ui.gridContainer.style.transform = `scale(${this.state.zoom})`;
            this.ui.gridContainer.style.marginBottom = this.state.zoom > 1 ? `${(this.state.zoom - 1) * 200}px` : '0';
        }
        this.ui.zoomDisplay.textContent = `${Math.round(this.state.zoom * 100)}%`;
    }

    updateStatus(msg) { if (this.ui.status) this.ui.status.textContent = msg; }

    renderPalette() {
        this.ui.palette.innerHTML = '';
        this.CONSTANTS.COLORS.forEach(c => {
            const btn = document.createElement('button');
            btn.className = 'color-swatch'; btn.style.backgroundColor = c;
            btn.onclick = () => this.setActiveColor(c);
            this.ui.palette.appendChild(btn);
        });
    }

    exportPNG() {
        const c = document.createElement('canvas'); const s = 20; const z = this.state.gridSize;
        c.width = z * s; c.height = z * s; const ctx = c.getContext('2d');
        for (let y = 0; y < z; y++) for (let x = 0; x < z; x++) {
            const color = this.state.gridData[y][x];
            if (color !== 'transparent') { ctx.fillStyle = color; ctx.fillRect(x * s, y * s, s, s); }
        }
        const a = document.createElement('a'); a.download = 'pixel.png'; a.href = c.toDataURL(); a.click();
    }
}