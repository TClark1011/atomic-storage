import {
  SerializationController,
  StorageController,
  StorageControllerOption,
} from './types/coreTypes';

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
