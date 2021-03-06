import { updateState } from '../handlers/update-state.js';
import { initGreeting } from '../handlers/init-greeting.js';

export const initGreetingListener = () => {
  document.addEventListener('DOMContentLoaded', initGreeting);

  document
    .getElementById('update-input')
    .addEventListener('update', updateState);
};
