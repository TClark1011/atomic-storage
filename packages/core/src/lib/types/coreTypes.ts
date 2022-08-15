import { Updater } from './utilityTypes';

export type SerializationController<Value> = {
  stringify: (value: Value) => string;
  parse: (serialized: string) => Value;
};

export type StorageController = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

export type StorageControllerPreset = 'localStorage' | 'sessionStorage';

export type StorageControllerOption =
  | StorageController
  | StorageControllerPreset;

export type StorageAtomOptions<Value> = {
  serializationController: SerializationController<Value>;
  initialValue: Value;
  storageController: StorageControllerOption;
  key: string;
};

export type StorageAtom<Value> = {
  get: () => Value | null;
  set: (value: Value) => void;
  key: string;
  update: (updater: Updater<Value>) => void;
};
