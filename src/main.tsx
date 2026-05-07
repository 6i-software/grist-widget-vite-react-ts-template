import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/global.css'
import App from './App.tsx'

const root = document.getElementById('root')!;
if (!root) throw new Error('[App] Root element not found in DOM.');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
