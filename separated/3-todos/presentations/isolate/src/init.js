import { initialize } from './controllers/initialize.js';
import { showList } from './controllers/show-list.js';
import { add } from './controllers/add.js';
import { toggle } from './controllers/toggle.js';
import { change } from './controllers/change.js';
import { remove } from './controllers/remove.js';

export const init = async () => {
  await initialize();

  return {
    toggle,
    add,
    showList,
    change,
    remove,
  };
};
