import createStorageAtom from '@atomic-storage/core';
import { act, render, renderHook } from '@testing-library/react';
import { useStorageAtom, useStorageAtomWithSelector } from '..';

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

    act(() => {
      atom.reset();
    });
    expect(result.current).toBe(INITIAL_VALUE);
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

    act(() => {
      atom.reset();
    });
    expect(firstInstanceResult.current).toBe(INITIAL_VALUE);
    expect(secondInstanceResult.current).toBe(INITIAL_VALUE);
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

describe('useStorageAtomWithSelector', () => {
  it('Returns selection', () => {
    const value = {
      a: 'a',
      b: 'b',
    };

    const atom = createStorageAtom({
      initialValue: value,
      key: `${Math.random()}`,
      storageController: 'localStorage',
    });

    const { result } = renderHook(() =>
      useStorageAtomWithSelector(atom, (v) => v.a)
    );

    expect(atom.get()).toEqual(value);
    expect(result.current).toBe(value.a);
  });

  it('Only re-renders if selection changes', async () => {
    const value = {
      a: 'a',
      b: 'b',
    };

    const atom = createStorageAtom({
      initialValue: value,
      key: `${Math.random()}`,
      storageController: 'localStorage',
    });

    let renderCount = 0;
    const Component = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const a = useStorageAtomWithSelector(atom, (v) => v.a);
      return <div>renderCount: {++renderCount}</div>;
    };

    const { findByText } = render(<Component />);

    await findByText('renderCount: 1');

    // Update that does not change the selection (the `a` key)
    // should NOT cause a re-render
    const noRerenderUpdate = {
      ...value,
      b: 'changed',
    };
    act(() => {
      atom.set(noRerenderUpdate);
    });

    expect(atom.get()).toEqual(noRerenderUpdate);
    await findByText('renderCount: 1');

    // Update that changes `a` field SHOULD cause a re-render
    const rerenderUpdate = {
      ...value,
      a: 'also changed',
    };
    act(() => {
      atom.set(rerenderUpdate);
    });
    expect(atom.get()).toEqual(rerenderUpdate);
    await findByText('renderCount: 2');

    act(() => {
      atom.reset();
    });
    await findByText('renderCount: 3');

    act(() => {
      atom.reset();
    });
    await findByText('renderCount: 3');
  });
});
