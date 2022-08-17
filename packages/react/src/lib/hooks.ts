import { StorageAtom } from '@atomic-storage/core';
import { useSyncExternalStore } from 'react';

export const useStorageAtom = <Value>(atom: StorageAtom<Value>): Value =>
  useSyncExternalStore(atom.subscribe, atom.get);

export const useStorageAtomWithSelector = <Value, Selection>(
  atom: StorageAtom<Value>,
  selector: (p: Value) => Selection
): Selection =>
  useSyncExternalStore(atom.subscribe, () => selector(atom.get()));
