# Cognitive Load Adaptive Learning Platform - Frontend

This is the standalone frontend application for the Cognitive Load Adaptive Learning Engine, built with **React 18**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Monaco Editor**.

## Getting Started

### 1. Install Dependencies
\\\ash
npm install
\\\

### 2. Run the Development Server
\\\ash
npm run dev
\\\

The frontend will start at: \http://localhost:3000\

### 3. Build for Production
\\\ash
npm run build
\\\

Production files will be generated in the \dist/\ directory.

### 4. Preview Production Build
\\\ash
npm run preview
\\\

## Backend Connectivity & Offline Fallback
- The application connects to the API URL specified by \VITE_API_URL\ in \.env\.
- If the backend is unavailable or offline, the frontend includes a built-in mock fallback engine and client-side Python execution (via Pyodide WASM and in-browser emulation).
