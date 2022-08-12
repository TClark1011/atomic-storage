import { SetOptional, Updater } from './utilityTypes';

export type SerializationController<Value> = {
  stringify: (value: Value) => string;
  parse: (serialized: string) => Value;
};

const getDefaultSerializationController = <
  Value
>(): SerializationController<Value> => ({
  stringify: JSON.stringify,
  parse: JSON.parse,
});

export type StorageController = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type StorageControllerPreset = 'localStorage' | 'sessionStorage';

export type StorageAtomOptions<Value> = {
  serializationController: SerializationController<Value>;
  initialValue: Value;
  storageController: StorageController | StorageControllerPreset;
  key: string;
};

export type StorageAtom<Value> = {
  get: () => Value;
  set: (value: Value) => void;
  key: string;
  update: (updater: Updater<Value>) => void;
};

const extractStorageController = (
  storageControllerOrPreset: StorageController | StorageControllerPreset
): StorageController => {
  if (storageControllerOrPreset === 'localStorage') {
    return localStorage;
  }
  if (storageControllerOrPreset === 'sessionStorage') {
    return sessionStorage;
  }
  return storageControllerOrPreset;
};

export type CreateStorageAtomOptions<Value> = SetOptional<
  StorageAtomOptions<Value>,
  'serializationController'
>;

export const createStorageAtom = <Value>({
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

  set(initialValue);

  const get = (): Value => {
    const raw = controller.getItem(key);

    if (raw === null) {
      throw new Error(`No value found for key '${key}'`);
    }

    return parse(raw);
  };

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
