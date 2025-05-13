import { createRoot } from 'react-dom/client';
import App from './App';
import '@uswds/uswds/dist/css/uswds.min.css';
import '@uswds/uswds/dist/js/uswds.min.js';
import './css/styles.css';
import { BrowserRouter } from 'react-router';

const container = document.getElementById('app');
if (!container) {
  throw new Error('Failed to find the app container element');
}
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
