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
import { SetOptional, Updater } from './types/utilityTypes';

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
  const registeredMiddleware = middleware.map(composeMiddlewareRegistration);

  const runMiddleware = (value: Value, operation: StorageAtomOperation) => {
    const result = registeredMiddleware.reduce(
      (result, currentMiddleware) =>
        executeMiddleware(result, operation, currentMiddleware),
      value
    );
    return result;
  };

  const set = (value: Value): void => {
    const processed = runMiddleware(value, 'set');
    const stringified = stringify(processed);
    controller.setItem(key, stringified);
  };

  const get = (): Value => {
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

  const update = (updater: Updater<Value>) => {
    const value = get();
    const updated = updater(value);
    set(updated);
  };

  return {
    get,
    set,
    update,
    key,
    addMiddleware: (middleware) => {
      registeredMiddleware.push(composeMiddlewareRegistration(middleware));
    },
  };
};

export default createStorageAtom;
