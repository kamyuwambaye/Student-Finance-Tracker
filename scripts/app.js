// Main entry point
import { initUI, render } from './ui.js';
import { load, save, clearAll } from './storage.js';
import { validateRecord } from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
  initUI();
  render();
});
