import createStorageAtom from '@atomic-storage/core';
import { act, render, renderHook } from '@testing-library/react';
import {
  createStorageAtomHook,
  createStorageAtomHookWithSelector,
} from '../lib/hookFactories';

describe('createStorageAtomHook', () => {
  it('Returns atom value', () => {
    const myAtom = createStorageAtom({
      key: `${Math.random()}`,
      initialValue: 0,
      storageController: 'localStorage',
    });

    const useMyAtom = createStorageAtomHook(myAtom);

    const { result } = renderHook(useMyAtom);

    expect(result.current).toBe(0);
  });

  it('Re-renders on atom change', () => {
    const myAtom = createStorageAtom({
      key: `${Math.random()}`,
      initialValue: 0,
      storageController: 'localStorage',
    });

    const useMyAtom = createStorageAtomHook(myAtom);

    const { result } = renderHook(useMyAtom);

    expect(result.current).toBe(0);

    act(() => {
      myAtom.set(10);
    });
    expect(result.current).toBe(10);

    act(() => {
      myAtom.set((v) => v + 1);
    });
    expect(result.current).toBe(11);
  });
});

describe('createStorageAtomHookWithSelector', () => {
  it('Returns selection', () => {
    const value = {
      a: 'a',
      b: 'b',
    };

    const myAtom = createStorageAtom({
      initialValue: value,
      key: `${Math.random()}`,
      storageController: 'localStorage',
    });

    const useMyAtomWithSelector = createStorageAtomHookWithSelector(myAtom);
    const { result } = renderHook(() => useMyAtomWithSelector((v) => v.a));

    expect(result.current).toBe(value.a);
  });

  it('Only re-renders if selection changes', async () => {
    const value = {
      a: 'a',
      b: 'b',
    };

    const myAtom = createStorageAtom({
      initialValue: value,
      key: `${Math.random()}`,
      storageController: 'localStorage',
    });
    const useMyAtomWithSelector = createStorageAtomHookWithSelector(myAtom);
    let renderCount = 0;
    const Component = () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const a = useMyAtomWithSelector((v) => v.a);
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
      myAtom.set(noRerenderUpdate);
    });

    expect(myAtom.get()).toEqual(noRerenderUpdate);
    await findByText('renderCount: 1');

    // Update that changes `a` field SHOULD cause a re-render
    const rerenderUpdate = {
      ...value,
      a: 'also changed',
    };
    act(() => {
      myAtom.set(rerenderUpdate);
    });
    expect(myAtom.get()).toEqual(rerenderUpdate);
    await findByText('renderCount: 2');
  });
});
