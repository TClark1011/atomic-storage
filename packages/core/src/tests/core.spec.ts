import createStorageAtom, { atomGetMiddleware, atomSetMiddleware } from '../';
import { StorageController } from '../lib/types/coreTypes';
import { asyncSleep, identity, mockStorage } from './testHelpers';

const getRandomKey = () => JSON.stringify(Math.random());

const { reset, storage } = mockStorage();
afterEach(() => {
  reset();
});

describe('Basic Functionality with localStorage', () => {
  it('Can create a basic storage atom', () => {
    const KEY = getRandomKey();
    const VALUE = 5;

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
    });

    expect(basicAtom).toHaveProperty('get');
    expect(basicAtom).toHaveProperty('set');
    expect(basicAtom).toHaveProperty('key');
    expect(basicAtom).toHaveProperty('subscribe');

    expect(basicAtom.get()).toBe(VALUE);
    expect(basicAtom.key).toBe(KEY);
  });

  it('Can set values', () => {
    const KEY = getRandomKey();
    const VALUE = 5;
    const NEW_VALUE = 6;

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
    });

    expect(basicAtom.get()).toEqual(VALUE);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    const setResult = basicAtom.set(NEW_VALUE);
    expect(setResult).toBe(NEW_VALUE);
    expect(basicAtom.get()).toBe(NEW_VALUE);
    expect(storage.getItem(KEY)).toBe(JSON.stringify(NEW_VALUE));

    const secondSetResult = basicAtom.set((v) => v + 1);
    expect(secondSetResult).toBe(NEW_VALUE + 1);
    expect(basicAtom.get()).toBe(NEW_VALUE + 1);
    expect(storage.getItem(KEY)).toBe(JSON.stringify(NEW_VALUE + 1));
    expect(storage.getItem(KEY)).toBe(JSON.stringify(basicAtom.get()));
  });

  it('Can set strings', () => {
    const KEY = getRandomKey();
    const VALUE = 'a';
    const NEW_VALUE = 'a+';

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
    });

    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set((v) => v.concat('+'));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE.concat('+')));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  it('Does not override existing values on creation', () => {
    const KEY = getRandomKey();
    const VALUE = 100;
    const ATOM_VALUE = 0;

    storage.setItem(KEY, JSON.stringify(VALUE));
    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: ATOM_VALUE,
    });

    // Since value already existed, atom should not hold its initial
    // value
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  it('Can update', () => {
    const KEY = getRandomKey();
    const VALUE = 100;

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
    });

    expect(atom.get()).toBe(VALUE);

    atom.set((v) => v + 1);
    expect(atom.get()).toBe(VALUE + 1);
  });

  it('Can reset', () => {
    const VALUE = 5;
    const KEY = getRandomKey();
    const atom = createStorageAtom({
      initialValue: VALUE,
      storageController: 'localStorage',
      key: KEY,
    })

    atom.set(-1);

    const resetResult = atom.reset();
    expect(resetResult).toBe(VALUE);
    expect(atom.get()).toBe(VALUE);
    expect(storage.getItem(KEY)).toBe(JSON.stringify(VALUE));
  })

  test('Subscriptions', () => {
    const KEY = getRandomKey();
    const subscriptionFn = jest.fn();

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: 0,
    });

    const unsubscribe = atom.subscribe(subscriptionFn);

    expect(atom.get()).toBe(0);

    expect(subscriptionFn).toHaveBeenCalledTimes(0);

    atom.set(1);
    expect(subscriptionFn).toHaveBeenLastCalledWith(1);
    expect(atom.get()).toBe(1);

    atom.set(2);
    expect(subscriptionFn).toHaveBeenLastCalledWith(2);
    expect(atom.get()).toBe(2);

    expect(subscriptionFn).toHaveBeenCalledTimes(2);
    unsubscribe();

    atom.set(3);

    // Subscription callback should not be called after unsubscribe
    expect(subscriptionFn).toHaveBeenCalledTimes(2);

    expect(atom.get()).toBe(3);
  });
});

describe('Advanced Use Cases', () => {
  test('sessionStorage', () => {
    const KEY = getRandomKey();
    const VALUE = 5;
    const NEW_VALUE = 6;

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'sessionStorage',
      initialValue: VALUE,
    });

    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set((v) => v + 1);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  test('Custom Serializer', () => {
    const KEY = getRandomKey();
    const VALUE = 5;
    const NEW_VALUE = 6;

    const customController = {
      stringify: (v: number) => v.toString(),
      parse: (s: string) => parseInt(s, 10),
    };

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
      serializationController: customController,
    });

    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set((v) => v + 1);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  test('Custom Storage', () => {
    const KEY = getRandomKey();
    const VALUE = 18412897412487;
    const NEW_VALUE = 987654;

    const bucket = new Map<string, string>();
    const customStorage: StorageController = {
      getItem: (p: string) => bucket.get(p) ?? null,
      setItem: (p: string, v: string) => bucket.set(p, v),
    };

    const basicAtom = createStorageAtom({
      key: KEY,
      storageController: customStorage,
      initialValue: VALUE,
    });

    expect(bucket.get(KEY)).toEqual(JSON.stringify(VALUE));
    expect(bucket.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(bucket.get(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(bucket.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set((v) => v + 1);
    expect(bucket.get(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(bucket.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  test('Object State', () => {
    const KEY = getRandomKey();
    const VALUE = { a: 1, b: 2 };
    const NEW_VALUE = { a: 2, c: 3 };

    const basicAtom = createStorageAtom<
      Partial<Record<'a' | 'b' | 'c', number>>
    >({
      key: KEY,
      storageController: 'localStorage',
      initialValue: VALUE,
    });

    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(VALUE);
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(basicAtom.get());

    basicAtom.set(NEW_VALUE);
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(NEW_VALUE);
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(basicAtom.get());

    basicAtom.set((v) => ({ ...v, b: (v?.b ?? 0) + 1, c: 0 }));
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toStrictEqual({
      a: 2,
      b: 1,
      c: 0,
    });
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(basicAtom.get());
  });
});

describe('Middleware', () => {
  test('Simple middleware', () => {
    const callbackFn = jest.fn(identity);

    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [callbackFn],
    });

    UPDATES.forEach((value, index) => {
      atom.set(value);
      expect(callbackFn).toHaveBeenLastCalledWith(value, 'set');
      atom.get();
      expect(callbackFn).toHaveBeenLastCalledWith(value, 'get');

      expect(callbackFn).toHaveBeenCalledTimes((index + 1) * 2 + 2);
    });
  });

  test('Get-only Middleware', () => {
    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];
    const callbackFn = jest.fn(identity);

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [
        {
          operations: ['get'],
          callback: callbackFn,
        },
      ],
    });

    UPDATES.forEach((value) => {
      atom.set(value);
      atom.get();
      expect(callbackFn).toHaveBeenLastCalledWith(value, 'get');
    });

    expect(callbackFn).toHaveBeenCalledTimes(UPDATES.length + 1);
  });

  test('Set-only Middleware', () => {
    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];
    let syncedValue = INITIAL_VALUE;

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [
        {
          operations: ['set'],
          callback: (v) => {
            syncedValue = v;
            return v;
          },
        },
      ],
    });

    UPDATES.forEach((value) => {
      atom.set(value);
      expect(syncedValue).toEqual(value);
    });
  });
  test('Add new middleware during runtime', () => {
    const callbackFn = jest.fn(identity);

    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
    });

    UPDATES.forEach((value) => {
      atom.set(value);
      atom.get();
      expect(callbackFn).toHaveBeenCalledTimes(0);
    });

    atom.addMiddleware(callbackFn);

    UPDATES.forEach((value, index) => {
      atom.set(value);
      expect(callbackFn).toHaveBeenLastCalledWith(value, 'set');
      atom.get();
      expect(callbackFn).toHaveBeenLastCalledWith(value, 'get');

      expect(callbackFn).toHaveBeenCalledTimes((index + 1) * 2);
    });
  });

  test('Async middleware', async () => {
    const KEY = getRandomKey();
    const INITIAL_VALUE = -1;
    let syncedValue = INITIAL_VALUE;

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [
        {
          operations: ['set'],
          callback: async (v) => {
            syncedValue = v;
          },
        },
      ],
    });

    atom.set(1);
    await asyncSleep(50);
    expect(syncedValue).toEqual(1);

    atom.set(2);
    await asyncSleep(50);
    expect(syncedValue).toEqual(2);

    atom.set(3);
    await asyncSleep(50);
    expect(syncedValue).toEqual(3);

    atom.set(4);
    await asyncSleep(50);
    expect(syncedValue).toEqual(4);
  });

  test('Multiple plain middleware', () => {
    const firstMiddleware = jest.fn(identity);
    const secondMiddleware = jest.fn(identity);
    const thirdMiddleware = jest.fn(identity);

    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [firstMiddleware, secondMiddleware, thirdMiddleware],
    });

    UPDATES.forEach((value) => {
      atom.set(value);
      expect(firstMiddleware).toHaveBeenLastCalledWith(value, 'set');
      expect(secondMiddleware).toHaveBeenLastCalledWith(value, 'set');
      expect(thirdMiddleware).toHaveBeenLastCalledWith(value, 'set');
    });
  });

  test('Multiple operation-specific middleware (composed with helper functions)', () => {
    const getterMiddleware = atomGetMiddleware<number>(jest.fn(identity));
    const setterMiddleware = atomSetMiddleware<number>(jest.fn(identity));

    const KEY = getRandomKey();
    const INITIAL_VALUE = 5;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [getterMiddleware, setterMiddleware],
    });

    UPDATES.forEach((value) => {
      atom.set(value);
      expect(setterMiddleware.callback).toHaveBeenLastCalledWith(value, 'set');
      expect(getterMiddleware.callback).not.toHaveBeenLastCalledWith(
        value,
        'set'
      );
      atom.get();
      expect(getterMiddleware.callback).toHaveBeenLastCalledWith(value, 'get');
      expect(setterMiddleware.callback).not.toHaveBeenLastCalledWith(
        value,
        'get'
      );
    });
  });

  test('Validation middleware', () => {
    const MIDDLEWARE_ERROR_MESSAGE = 'Value must be positive';
    const parsePositiveNumber = (n: number) => {
      if (n < 0) {
        throw new Error(MIDDLEWARE_ERROR_MESSAGE);
      }
      return n;
    };
    const KEY = getRandomKey();
    const INITIAL_VALUE = 0;

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [atomSetMiddleware(parsePositiveNumber)],
    });

    atom.set(1);
    expect(atom.get()).toEqual(1);

    expect(() => atom.set(-1)).toThrowError(MIDDLEWARE_ERROR_MESSAGE);
  });

  test('Middleware that affects value', () => {
    const incrementOnSet = atomSetMiddleware((v: number) => v + 1);

    const KEY = getRandomKey();
    const INITIAL_VALUE = 0;
    const UPDATES = [-23, 876, -151259, 125, 6, 873];

    const atom = createStorageAtom({
      key: KEY,
      storageController: 'localStorage',
      initialValue: INITIAL_VALUE,
      middleware: [incrementOnSet],
    });

    expect(atom.get()).toEqual(INITIAL_VALUE + 1);

    UPDATES.forEach((value) => {
      atom.set(value);
      expect(atom.get()).toEqual(value + 1);
    });
  });
});
