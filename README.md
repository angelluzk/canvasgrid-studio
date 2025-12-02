# 🎨 CanvasGrid Studio Pro

![Project Status](https://img.shields.io/badge/status-stable-green)
![Version](https://img.shields.io/badge/version-2.1.0-purple)

**CanvasGrid Studio Pro** é uma suíte de criação de arte digital web-based, desenvolvida para oferecer uma experiência profissional, fluida e imersiva. O projeto combina um motor de desenho vetorial/raster com camadas e um editor de Pixel Art dedicado.

🔗 **[Acesse a Demo Online](EM BREVE)**

---

## ✨ Funcionalidades Principais

### 🖌️ Módulo: Canvas Draw Pro
Um estúdio de desenho livre focado em performance e liberdade criativa.
* **Sistema de Camadas (Layers):** Crie, ordene e exclua camadas independentes.
* **Motor High-DPI:** Renderização nítida em telas Retina/4K.
* **Histórico Robusto:** Sistema de Undo/Redo (Ctrl+Z / Ctrl+Y) sem perda de dados.
* **Ferramentas:** Pincel (com suavização), Borracha, Balde de Tinta e Conta-gotas.
* **Zoom Infinito:** Navegação fluida pela arte.

### 👾 Módulo: Pixel Art Editor
Um editor preciso para criação de sprites e assets de jogos.
* **Grids Dinâmicos:** Suporte de 8x8 até 64x64 pixels.
* **Ferramentas de Precisão:** Lápis, Borracha, Flood Fill e Picker.
* **Exportação Inteligente:** Salva PNGs em alta resolução (Upscaled) prontos para uso.
* **Interface Dedicada:** Paleta de cores e controles focados em Pixel Art.

---

## 🛠️ Stack Tecnológica

O projeto foi construído seguindo os princípios de **Vanilla JS Moderno** e **Orientação a Objetos (OOP)**.

* **Core:** HTML5, CSS3, JavaScript (ES6+ Modules).
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) (Configuração via CDN para prototipagem ágil).
* **Ícones:** [Lucide Icons](https://lucide.dev/).
* **Arquitetura:**
    * Classes JS separadas (`CanvasDrawPro`, `PixelArtEditor`).
    * Gerenciamento de Estado centralizado em cada módulo.
    * Event Delegation para alta performance no DOM.

---

## 🚀 Como Executar Localmente

Este projeto utiliza Módulos ES6 (`import`/`export`), o que requer um servidor HTTP local para evitar bloqueios de CORS do navegador.

### Pré-requisitos
* Um navegador moderno (Chrome, Edge, Firefox).
* Git (opcional).

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU-USUARIO/canvasgrid-studio.git](https://github.com/SEU-USUARIO/canvasgrid-studio.git)
    cd canvasgrid-studio
    ```

2.  **Inicie um servidor local:**

    * **Opção A (Python 3):**
        ```bash
        python -m http.server 8000
        ```
    * **Opção B (Node.js / http-server):**
        ```bash
        npx http-server .
        ```
    * **Opção C (VS Code):**
        Instale a extensão "Live Server" e clique em "Go Live" no canto inferior direito.

3.  **Acesse:**
    Abra `http://localhost:8000` no seu navegador.

---

## ⌨️ Atalhos de Teclado

Maximize sua produtividade com hotkeys profissionais:

| Tecla | Ação |
| :--- | :--- |
| **B** | Ferramenta Pincel / Lápis |
| **E** | Ferramenta Borracha |
| **F** / **G** | Balde de Tinta (Fill) |
| **I** | Conta-gotas (Eyedropper) |
| **[** | Diminuir Pincel |
| **]** | Aumentar Pincel |
| **Ctrl + Z** | Desfazer (Undo) |
| **Ctrl + Y** | Refazer (Redo) |
| **Scroll** | Zoom In / Out (Segurando Ctrl em alguns navegadores) |

---

## 🤝 Contribuição

Este é um projeto Open Source focado em aprendizado e portfólio. Sinta-se livre para abrir Issues ou Pull Requests.

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Faça o Commit (`git commit -m 'Adicionando NovaFeature'`).
4.  Faça o Push (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

## 👩‍🎓 Autoria

<img src="https://github.com/angelluzk.png" width="100px;" alt="Foto de Angel Luz"/>

> Desenvolvido com 💛 por **Angel Luz**.

Se quiser conversar, colaborar ou oferecer uma oportunidade:

📬 E-mail: [contatoangelluz@gmail.com](mailto:contatoangelluz@gmail.com)  
🐙 GitHub: [@angelluzk](https://github.com/angelluzk)  
💼 LinkedIn: [linkedin.com/in/angelitaluz](https://www.linkedin.com/in/angelitaluz/)  
🗂️Website / Portfólio: [meu_portfolio/](https://angelluzk.github.io/meu_portfolio/) 

-----