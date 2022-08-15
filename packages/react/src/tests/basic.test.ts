import createStorageAtom from '@atomic-storage/core';
import { renderHook } from '@testing-library/react';
import useStorageAtomState from '../lib/useStorageAtomState';

describe('useStorageAtom', () => {
  test('Basic behaviour', () => {
    const INITIAL_VALUE = 'initial';
    const atom = createStorageAtom({
      key: 'test',
      initialValue: INITIAL_VALUE,
      storageController: 'localStorage',
    });

    const { result, rerender } = renderHook(() => useStorageAtomState(atom));

    expect(atom.get()).toBe(INITIAL_VALUE);
    expect(result.current[0]).toBe(INITIAL_VALUE);

    const UPDATE_VIA_HOOK = 'setState';
    result.current[1](UPDATE_VIA_HOOK);
    rerender();

    expect(result.current[0]).toBe(UPDATE_VIA_HOOK);
    expect(atom.get()).toBe(UPDATE_VIA_HOOK);

    const UPDATE_VIA_ATOM = 'atom.set';
    atom.set(UPDATE_VIA_ATOM);
    rerender();

    expect(atom.get()).toBe(UPDATE_VIA_ATOM);
    expect(result.current[0]).toBe(UPDATE_VIA_ATOM);
  });
});
