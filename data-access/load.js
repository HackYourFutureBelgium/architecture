import { store } from './local-storage/store.js';
import { getItem } from './local-storage/get-item.js';
import { setItem } from './local-storage/set-item.js';
import { removeItem } from './local-storage/remove-item.js';

import { state } from './state.js';

import { validate } from '../lib/validate.js';

export const load = async (dataPath = '') => {
  // read and log initial localStorage entries
  const storeKeys = Object.keys(store);
  console.log(
    ': persisted state:',
    storeKeys.reduce(
      (all, next) => Object.assign(all, { [next]: getItem(next) }),
      {},
    ),
  );

  // --- fetch the data & schema, resolve them if they are ok ---

  // declare URLs
  const windowOrigin =
    window.location.origin === 'null'
      ? window.parent.location.origin
      : window.location.origin;
  const dataURL = `${windowOrigin}/${dataPath}`;
  const schemaURL = `${windowOrigin}/${dataPath.replace(
    '.json',
    '.schema.json',
  )}`;
  // fetch data & schema (if possible)
  const [dataRes, schemaRes] = await Promise.allSettled([
    fetch(dataURL),
    fetch(schemaURL),
  ]);
  // exit early if the data response is not ok
  if (!dataRes.value.ok) {
    throw new Error(
      `unable to load data: ${dataRes.value.statusText}\n\n- try fixing your data path and refreshing the page\n`,
    );
  }
  // resolve the data
  const data = await dataRes.value.json();
  // log loaded data
  console.log(`: loaded data:`, data);
  // resolve and assign the schema if it was ok
  const schema = schemaRes.value.ok ? await schemaRes.value.json() : null;

  // --- initialize store state with new data ---

  const keptKeys = [];
  for (const key in data) {
    if (getItem(key) !== null) {
      keptKeys.push([key, getItem(key)]);
    }
  }
  if (keptKeys.length > 0) {
    console.groupCollapsed(
      '... keeping persisted keys that are also in the loaded data',
    );
    keptKeys.forEach((entry) => console.log(`${entry[0]}:`, entry[1]));
    console.groupEnd();
  }

  const removedKeys = [];
  for (const key of storeKeys) {
    if (!(key in data)) {
      removedKeys.push([key, getItem(key)]);
      removeItem(key);
    }
  }
  if (removedKeys.length > 0) {
    console.groupCollapsed(
      '... removing persisted keys that are not in loaded data',
    );
    removedKeys.forEach((entry) => console.log(`${entry[0]}:`, entry[1]));
    console.groupEnd();
  }

  const missingKeys = [];
  for (const key in data) {
    if (getItem(key) === null) {
      missingKeys.push([key, data[key]]);
      setItem(key, data[key]);
    }
  }
  if (missingKeys.length > 0) {
    console.groupCollapsed(
      '... persisting keys that are in loaded data but were missing in state',
    );
    missingKeys.forEach((entry) => console.log(`${entry[0]}:`, entry[1]));
    console.groupEnd();
  }

  console.log(': initial state:', state());
  // --- validate initial state against schema, if a schema was found ---

  if (schema) {
    console.log(': schema:', schema);
    // read current state
    const initialState = state();
    // validate schema against current state, not against the fetched data!
    const { isValid, validationErrors } = validate(schema, initialState);
    // log the success/failure of validation
    if (isValid) {
      console.log(': initial state is valid, it matches the schema');
    } else {
      // throw a (hopefully) helpful error if the state was not valid
      console.log(
        '%cvalidation errors:',
        'color: red; font-weight: bold;',
        validationErrors,
      );
      throw new Error(
        `initial state is not valid: \n\nvalidation errors are logged above ^\n`,
      );
    }

    console.log(
      '--- ---  finished loading and validating initial state  --- ---',
    );
  } else {
    console.log('--- ---  finished loading initial state  --- ---');
  }
  console.log('\n\n');
};