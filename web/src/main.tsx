import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/heroui.css';
import './styles/constants.css';
import './styles/components.css';
import './styles/style.css';
import './styles/dark.css';
import './styles/react-shell.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
