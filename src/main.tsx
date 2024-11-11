import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializeDatabase } from './lib/database';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

// Initialize database before rendering
initializeDatabase().then(() => {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  );
});