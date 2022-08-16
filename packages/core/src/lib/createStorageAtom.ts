import {
  composeMiddlewareRegistration,
  executeMiddleware,
  extractStorageController,
  getDefaultSerializationController,
} from './internalHelpers';
import {
  StorageAtom,
  StorageAtomOperation,
  StorageAtomOptions,
} from './types/coreTypes';
import { SetOptional, UpdateDeriver } from './types/utilityTypes';
import { generateId } from './utils';

export type CreateStorageAtomOptions<Value> = SetOptional<
  StorageAtomOptions<Value>,
  'serializationController' | 'middleware'
>;

const createStorageAtom = <Value>({
  storageController,
  initialValue,
  key,
  serializationController: {
    parse,
    stringify,
  } = getDefaultSerializationController<Value>(),
  middleware = [],
}: CreateStorageAtomOptions<Value>): StorageAtom<Value> => {
  const controller = extractStorageController(storageController);
  let registeredMiddleware = middleware.map(composeMiddlewareRegistration);

  const runMiddleware = (value: Value, operation: StorageAtomOperation) => {
    const result = registeredMiddleware.reduce(
      (result, currentMiddleware) =>
        executeMiddleware(result, operation, currentMiddleware),
      value
    );
    return result;
  };

  const set: StorageAtom<Value>['set'] = (update) => {
    const value =
      typeof update !== 'function'
        ? update
        : (update as UpdateDeriver<Value>)(get() ?? initialValue);
    const processed = runMiddleware(value, 'set');
    const stringified = stringify(processed);
    controller.setItem(key, stringified);
    return processed;
  };

  const get: StorageAtom<Value>['get'] = (): Value => {
    const raw = controller.getItem(key);

    if (raw === null) {
      set(runMiddleware(initialValue, 'get'));
      return initialValue;
    }

    const parsed = parse(raw);
    const processed = runMiddleware(parsed, 'get');
    return processed;
  };

  // We run `get` once at initialization to initialise the value
  // in storage if it hasn't already been set.
  get();

  const addMiddleware: StorageAtom<Value>['addMiddleware'] = (middleware) => {
    registeredMiddleware.push(composeMiddlewareRegistration(middleware));
  };

  const subscribe: StorageAtom<Value>['subscribe'] = (callback) => {
    const newId = generateId();
    registeredMiddleware.push({
      label: newId,
      callback: async (value) => callback(value),
      operations: ['set'],
    });
    const unsubscribe = () => {
      registeredMiddleware = registeredMiddleware.filter(
        (middleware) => middleware.label !== newId
      );
    };
    return unsubscribe;
  };

  return {
    get,
    set,
    key,
    addMiddleware,
    subscribe,
  };
};

export default createStorageAtom;
