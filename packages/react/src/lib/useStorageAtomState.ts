import { StorageAtom } from '@atomic-storage/core';
import { useEffect, useRef, useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const stubFn = () => {};

const useStorageAtomState = <Value>(atom: StorageAtom<Value>) => {
  // We store the unsubscribe callback in the ref so that we can unsubscribe
  const unsubscribeCallbackRef = useRef<() => void>(stubFn);

  const [value, setValue] = useState(atom.get());

  useEffect(() => {
    unsubscribeCallbackRef.current = atom.subscribe(setValue);
    return unsubscribeCallbackRef.current;
  }, [atom]);

  useEffect(() => {
    unsubscribeCallbackRef.current();
    atom.set(value);
    unsubscribeCallbackRef.current = atom.subscribe(setValue);
    // We un-subscribe before setting the value, that way the hook
    // does not get re-rendered by its own update, which would cause
    // an infinite loop if it did. We re-subscribe to the atom after
    // the update is sent

    return unsubscribeCallbackRef.current;
  }, [value, atom]);

  return [value, setValue] as const;
};

export default useStorageAtomState;
