import { MiddlewareCallback, MiddlewareRegistration } from './types/coreTypes';
export {
  MiddlewareCallback,
  MiddlewareRegistration,
  MiddlewareInitializer,
  StorageAtom,
  StorageAtomOperation,
  StorageController,
  StorageAtomOptions,
} from './types/coreTypes';

export const atomGetMiddleware = <Value>(
  callback: MiddlewareCallback<Value>
): MiddlewareRegistration<Value> => ({
  callback: callback,
  operations: ['get'],
  label: '',
});

export const atomSetMiddleware = <Value>(
  callback: MiddlewareCallback<Value>
): MiddlewareRegistration<Value> => ({
  callback: callback,
  operations: ['set'],
  label: '',
});
