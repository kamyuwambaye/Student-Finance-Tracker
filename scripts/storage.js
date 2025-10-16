// Handles localStorage persistence
const KEY = 'app:data';

export function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch (e) {
    console.warn('Bad JSON in storage', e);
    return [];
  }
}

export function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function clearAll() {
  localStorage.removeItem(KEY);
}

export function nuid() {
  return 'rec_' + Math.random().toString(36).slice(2, 9);
}
