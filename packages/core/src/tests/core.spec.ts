import createStorageAtom from '../';
import { StorageController } from '../lib/types/coreTypes';
import { mockStorage } from './testHelpers';

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
    expect(basicAtom).toHaveProperty('update');
    expect(basicAtom).toHaveProperty('key');

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

    expect(storage.getItem(KEY)).toEqual(JSON.stringify(VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.update((v) => v + 1);
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(storage.getItem(KEY)).toEqual(JSON.stringify(basicAtom.get()));
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

    basicAtom.update((v) => v.concat('+'));
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

    basicAtom.update((v) => v + 1);
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

    basicAtom.update((v) => v + 1);
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

    basicAtom.update((v) => v + 1);
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

    basicAtom.update((v) => ({ ...v, b: (v?.b ?? 0) + 1, c: 0 }));
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toStrictEqual({
      a: 2,
      b: 1,
      c: 0,
    });
    expect(JSON.parse(storage.getItem(KEY) ?? '')).toEqual(basicAtom.get());
  });
});
