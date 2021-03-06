import { updateEvent } from '../custom-events/update.js';
import { deleteEvent } from '../custom-events/delete.js';

/**
 * Renders a single list item with the options to update or remove the item.
 *
 * @param {object} item - An item object from the list.
 * @returns {HTMLDivElement} The root element for this component.
 * @fires CustomEvent#update
 * @fires CustomEvent#delete
 */
export const itemComponent = (item) => {
  const itemContainer = document.createElement('div');

  const checkboxEl = document.createElement('input');
  checkboxEl.type = 'checkbox';
  checkboxEl.checked = item.done;
  checkboxEl.addEventListener('change', (event) => {
    event.preventDefault();
    item.done = checkboxEl.checked;
    itemContainer.dispatchEvent(updateEvent(item));
  });
  itemContainer.appendChild(checkboxEl);

  const inputEl = document.createElement('input');
  inputEl.value = item.task;
  inputEl.addEventListener('change', (event) => {
    event.preventDefault();
    item.task = inputEl.value;
    itemContainer.dispatchEvent(updateEvent(item));
  });
  itemContainer.appendChild(inputEl);

  const deleteButtonEl = document.createElement('button');
  deleteButtonEl.innerText = 'X';
  deleteButtonEl.addEventListener('click', (event) => {
    event.preventDefault();
    itemContainer.dispatchEvent(deleteEvent(item.id));
  });
  itemContainer.appendChild(deleteButtonEl);

  return itemContainer;
};
