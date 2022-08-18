import { StorageAtom } from '@atomic-storage/core';
import { useStorageAtom, useStorageAtomWithSelector } from './hooks';

export const createStorageAtomHook =
  <AtomValue>(atom: StorageAtom<AtomValue>) =>
  () =>
    useStorageAtom(atom);

export const createStorageAtomHookWithSelector =
  <AtomValue>(atom: StorageAtom<AtomValue>) =>
  <Selection>(selector: (p: AtomValue) => Selection) =>
    useStorageAtomWithSelector(atom, selector);
