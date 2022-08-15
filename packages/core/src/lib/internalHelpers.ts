import {
  SerializationController,
  StorageController,
  StorageControllerOption,
  StorageAtomOperation,
  MiddlewareRegistration,
  MiddlewareInitializer,
} from './types/coreTypes';
import { isPromise } from './utils';

export const extractStorageController = (
  storageControllerOrPreset: StorageControllerOption
): StorageController => {
  if (storageControllerOrPreset === 'localStorage') {
    return localStorage;
  }
  if (storageControllerOrPreset === 'sessionStorage') {
    return sessionStorage;
  }
  return storageControllerOrPreset;
};

export const getDefaultSerializationController = <
  Value
>(): SerializationController<Value> => ({
  stringify: JSON.stringify,
  parse: JSON.parse,
});

export const executeMiddleware = <Value>(
  value: Value,
  operation: StorageAtomOperation,
  middleware: MiddlewareRegistration<Value>
): Value => {
  const valueApplies = middleware.operations.includes(operation);
  if (!valueApplies) {
    return value;
  }

  const result = middleware.callback(value, operation);
  if (isPromise(result)) {
    return value;
  }
  return result;
};

export const composeMiddlewareRegistration = <Value>(
  init: MiddlewareInitializer<Value>
): MiddlewareRegistration<Value> => {
  if (typeof init === 'function') {
    return {
      label: '',
      operations: ['get', 'set'],
      callback: init,
    };
  }
  return {
    ...init,
    label: init.label || '',
  };
};
