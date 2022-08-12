import { createStorageAtom } from './models';

const getRandomKey = () => JSON.stringify(Math.random());

// Mock local storage
const values = new Map();
const mockedStorage = {
  getItem: (p: string) => values.get(p),
  setItem: (p: string, v: unknown) => values.set(p, v),
};
Object.defineProperty(window, 'localStorage', {
  value: mockedStorage,
});
Object.defineProperty(window, 'sessionStorage', {
  value: mockedStorage,
});

beforeEach(() => {
  values.clear();
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

    expect(values.get(KEY)).toEqual(JSON.stringify(VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.update((v) => v + 1);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));
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

    expect(values.get(KEY)).toEqual(JSON.stringify(VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.update((v) => v.concat('+'));
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE.concat('+')));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));
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

    expect(values.get(KEY)).toEqual(JSON.stringify(VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.update((v) => v + 1);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));
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

    expect(values.get(KEY)).toEqual(JSON.stringify(VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.set(NEW_VALUE);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));

    basicAtom.update((v) => v + 1);
    expect(values.get(KEY)).toEqual(JSON.stringify(NEW_VALUE + 1));
    expect(values.get(KEY)).toEqual(JSON.stringify(basicAtom.get()));
  });

  test('Custom Storage', () => {
    const KEY = getRandomKey();
    const VALUE = 18412897412487;
    const NEW_VALUE = 987654;

    const bucket = new Map();
    const customStorage = {
      getItem: (p: string) => bucket.get(p),
      setItem: (p: string, v: unknown) => bucket.set(p, v),
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

    expect(JSON.parse(values.get(KEY))).toEqual(VALUE);
    expect(JSON.parse(values.get(KEY))).toEqual(basicAtom.get());

    basicAtom.set(NEW_VALUE);
    expect(JSON.parse(values.get(KEY))).toEqual(NEW_VALUE);
    expect(JSON.parse(values.get(KEY))).toEqual(basicAtom.get());

    basicAtom.update((v) => ({ ...v, b: (v?.b ?? 0) + 1, c: 0 }));
    expect(JSON.parse(values.get(KEY))).toStrictEqual({ a: 2, b: 1, c: 0 });
    expect(JSON.parse(values.get(KEY))).toEqual(basicAtom.get());
  });
});
