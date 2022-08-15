import {
  extractStorageController,
  getDefaultSerializationController,
} from './helpers';
import { StorageAtom, StorageAtomOptions } from './types/coreTypes';
import { SetOptional, Updater } from './types/utilityTypes';

export type CreateStorageAtomOptions<Value> = SetOptional<
  StorageAtomOptions<Value>,
  'serializationController'
>;

const createStorageAtom = <Value>({
  storageController,
  initialValue,
  key,
  serializationController: {
    parse,
    stringify,
  } = getDefaultSerializationController<Value>(),
}: CreateStorageAtomOptions<Value>): StorageAtom<Value> => {
  const controller = extractStorageController(storageController);

  const set = (value: Value): void => {
    const stringified = stringify(value);
    controller.setItem(key, stringified);
  };

  const get = (): Value => {
    const raw = controller.getItem(key);

    if (raw === null) {
      set(initialValue);
      return initialValue;
    }

    return parse(raw);
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
  };
};

export default createStorageAtom;
