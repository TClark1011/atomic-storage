import { StorageAtom } from '@atomic-storage/core';
import { useSyncExternalStore } from 'react';

const useStorageAtom = <Value>(atom: StorageAtom<Value>) =>
  useSyncExternalStore(atom.subscribe, atom.get);

export default useStorageAtom;
