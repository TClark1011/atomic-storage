import { SetOptional, Update } from './utilityTypes';

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

export type StorageAtomOperation = 'get' | 'set';

export type MiddlewareCallback<Value> = (
  p: Value,
  operation: StorageAtomOperation
) => Value | Promise<void>;

export type MiddlewareRegistration<Value> = {
  label: string;
  operations: StorageAtomOperation[];
  callback: MiddlewareCallback<Value>;
};

export type MiddlewareInitializer<Value> =
  | SetOptional<MiddlewareRegistration<Value>, 'label'>
  | MiddlewareCallback<Value>;

export type StorageAtom<Value> = {
  get: () => Value;
  set: (value: Update<Value>) => Value;
  key: string;
  addMiddleware: (middleware: MiddlewareInitializer<Value>) => void;
  subscribe: (callback: (value: Value) => void) => () => void;
  reset: () => Value;
};

export type StorageAtomOptions<Value> = {
  serializationController: SerializationController<Value>;
  initialValue: Value;
  storageController: StorageControllerOption;
  key: string;
  middleware: MiddlewareInitializer<Value>[];
};

export type SubscriptionRegistration<Value> = {
  id: string;
  callback: (value: Value) => void;
};
