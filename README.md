# VibeDev: High-Precision Cloud-Powered IDE

VibeDev is a sophisticated, browser-based integrated development environment (IDE) engineered for performance and intelligence. By bridging the gap between local filesystem manipulation (via WebContainers) and high-speed cloud inference (via Groq), VibeDev provides a seamless, professional-grade coding experience directly in the browser.

---

## 🏗️ Architectural Overview

VibeDev is built on a modular architecture designed to handle complex state management and high-frequency AI inference.

### Core Component Map
* **The Canvas (`workspace-client-canvas.tsx`)**: The orchestrator. It manages the layout, resizing logic, and the hierarchical connection between the Sidebar, Editor, Preview, and AI Panels.
* **The Intelligence Engine (`/src/app/api/`)**:
    * **`/chat/route.ts`**: Handles context-aware reasoning and codebase analysis using Claude/Groq models.
    * **`/autocomplete/route.ts`**: A high-frequency, low-latency FIM (Fill-In-the-Middle) endpoint optimized for "ghost-text" suggestions.
* **State Matrix (`/lib/store/use-ide-store.ts`)**: A robust Zustand-based state layer that synchronizes filesystem changes, editor tab focus, and UI theme states in real-time.
* **VM Layer (`/features/playground/`)**: Utilizes WebContainers to boot a persistent, Node.js-compatible environment within the browser, enabling live code execution and filesystem persistence.

---

## ⚡ Technical Features

### 1. High-Density Editor Integration
* **Monaco Engine**: Fully configured with custom themes (`vibedev-midnight` / `vibedev-clean-light`).
* **Inline Completion Provider**: Custom-registered Monaco Language Service that triggers AI suggestions based on cursor position and surrounding context (prefix/suffix analysis).
* **Keyboard Shortcuts**: Advanced command registry for `Ctrl+S` (Format + Disk Sync), `Alt+W` (Tab Management), and custom triggers for manual AI intervention.

### 2. Intelligent AI Infrastructure
* **Latency Optimization**: AI inference is offloaded to Groq's LPUs, bypassing local hardware constraints (OOM errors) and providing sub-200ms autocomplete responses.
* **Session Management**: Context-aware chat that maintains history and understands the "Active File" state to provide surgically accurate code injection.

### 3. Filesystem & Synchronization
* **Debounced Autosave**: A background-process architecture that captures keystrokes without blocking the main UI thread.
* **WebContainer Disk-Flush**: Real-time writing to the virtual filesystem, allowing immediate execution within the `WebContainerPreview` component.
* **Cloud-Atlas Sync**: Logic for pushing stateful changes back to a persistent backend database.

---

## Why VibeDev was Created
* **Overcoming Local Constraints:** Standard AI IDE extensions often require high-end local GPUs or massive RAM allocations, leading to frequent performance bottlenecks. VibeDev offloads this heavy inference to the cloud using Groq’s specialized LPU hardware, allowing it to run smoothly on any browser without crashing your local system.

* **Bridging Cloud and VM:** It integrates WebContainers, which allow for a full Node.js runtime inside the browser, with cloud-based AI to create a seamless "codespace" where you can write, run, and receive intelligent code suggestions simultaneously.

* **Developer Experience:** It was built to solve the "sluggish" feel of traditional web-based editors by implementing optimized, debounced autocomplete features that provide near-instant feedback.

---
## The Primary Uses of VibeDev
* **AI-Assisted Development:** Developers use VibeDev to write code faster using its inline "ghost-text" autocompletion, which suggests code snippets based on the surrounding file context.

* **Browser-Based Prototyping:** Because it utilizes WebContainers, you can use VibeDev to build, test, and preview full-stack applications directly in your browser without needing to configure a local development environment.

* **Context-Aware Coding:** The integrated chat panel allows you to perform deep analysis on your project files, providing a specialized space to troubleshoot, refactor, and implement new features while staying within the project workspace.

* **Version and Domain Management:** The platform is configured to manage technical assets associated with specific domain-driven projects, such as jerney.in, making it a dedicated tool for maintaining web project files and documentation.

---
## 🚀 Setup & Development

### Local Environment
1. **Clone the Repo:**
   ```bash
   git clone [repository-url]
   cd vibedev

2. **Environment Variables:**

Create a .env.local file:
 ```bash
 GROQ_API_KEY=your_key_here
 DATABASE_URL=your_db_connection_string
 NEXTAUTH_SECRET=your_auth_secret
```

3. **Execution:**

 ```bash
npm install
npm run dev
```

**Production Build**
The project includes a streamlined postinstall script and optimized build pipeline to ensure zero-configuration deployment on Vercel:

```bash
JSON
"scripts": {
  "build": "prisma generate && next build",
  "postinstall": "prisma generate"
}
```

## "VibeDev is officially live and deployed—experience high-performance, AI-assisted coding directly in your browser."

**You can also include a status badge if you'd like to show it's active:**

**"VibeDev | Live Status: http://vibe-dev-bice.vercel.app/"**

