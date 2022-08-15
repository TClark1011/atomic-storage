/* #region  Storage Mock */
type MockedStorage = typeof localStorage | typeof sessionStorage;
const storageBucket = new Map<string, string>();
const mockedStorageController: MockedStorage = {
  clear: () => storageBucket.clear(),
  getItem: (key) => storageBucket.get(key) ?? null,
  setItem: (key, value) => storageBucket.set(key, value),
  length: storageBucket.size,
  key: (index) => [...storageBucket.keys()][index],
  removeItem: (key) => storageBucket.delete(key),
};
export const mockStorage = () => {
  Object.defineProperty(window, 'localStorage', {
    value: mockedStorageController,
  });
  Object.defineProperty(window, 'sessionStorage', {
    value: mockedStorageController,
  });
  return {
    storage: mockedStorageController,
    reset: () => mockedStorageController.clear(),
  };
};

/* #endregion */

export const asyncSleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const identity = <T>(p: T) => p;
