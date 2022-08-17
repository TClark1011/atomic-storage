import createStorageAtom from '@atomic-storage/core';
import { act, render, renderHook } from '@testing-library/react';
import { useStorageAtom } from '..';

afterEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('useStorageAtom', () => {
  test('Basic behaviour', () => {
    const INITIAL_VALUE = 'initial';
    const atom = createStorageAtom({
      key: `${Math.random()}`,
      initialValue: INITIAL_VALUE,
      storageController: 'localStorage',
    });

    const { result } = renderHook(() => useStorageAtom(atom));

    expect(atom.get()).toBe(INITIAL_VALUE);
    expect(result.current).toBe(INITIAL_VALUE);

    const UPDATE_VIA_ATOM = 'atom.set';
    act(() => {
      atom.set(UPDATE_VIA_ATOM);
    });
    expect(atom.get()).toBe(UPDATE_VIA_ATOM);
    expect(result.current).toBe(UPDATE_VIA_ATOM);
  });

  test('Multiple consumers', () => {
    const INITIAL_VALUE = 0;
    const atom = createStorageAtom({
      initialValue: INITIAL_VALUE,
      key: `${Math.random()}`,
      storageController: 'sessionStorage',
    });

    const { result: firstInstanceResult } = renderHook(() =>
      useStorageAtom(atom)
    );
    const { result: secondInstanceResult } = renderHook(() =>
      useStorageAtom(atom)
    );

    expect(firstInstanceResult.current).toBe(INITIAL_VALUE);
    expect(secondInstanceResult.current).toBe(INITIAL_VALUE);

    const UPDATE = 1;
    act(() => {
      atom.set(UPDATE);
    });
    expect(firstInstanceResult.current).toBe(UPDATE);
    expect(secondInstanceResult.current).toBe(UPDATE);

    const ADJUSTMENT = 10;
    act(() => {
      atom.set((v) => v + ADJUSTMENT);
    });
    expect(firstInstanceResult.current).toBe(UPDATE + ADJUSTMENT);
    expect(secondInstanceResult.current).toBe(UPDATE + ADJUSTMENT);
  });

  test('Render Performance', async () => {
    const INITIAL_VALUE = 0;
    const atom = createStorageAtom({
      key: `${Math.random()}`,
      initialValue: INITIAL_VALUE,
      storageController: 'localStorage',
    });

    let renderCount = 0;
    const Component = () => {
      const value = useStorageAtom(atom);
      return (
        <div>
          <div>value: {value}</div>
          <div>renderCount: {++renderCount}</div>
        </div>
      );
    };

    const { findByText } = render(<Component />);

    await findByText(`value: ${INITIAL_VALUE}`);
    await findByText('renderCount: 1');

    const UPDATE = 100;
    act(() => {
      atom.set(UPDATE);
    });
    await findByText(`value: ${UPDATE}`);
    await findByText('renderCount: 2');

    act(() => {
      atom.set((v) => v + 1);
    });
    await findByText(`value: ${UPDATE + 1}`);
    await findByText('renderCount: 3');
  });
});
