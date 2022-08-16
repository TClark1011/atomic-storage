![Atomic Storage](assets/header-dark.png#gh-dark-mode-only)
![Atomic Storage](assets/header-light.png#gh-light-mode-only)

The easiest way to persist data in web apps. Skip the hassle of repeating keys over and over, checking if the data is null, and parsing it and dealing with typings. All with a minimalist API.

## Install

yarn

```zsh
yarn add @atomic-storage/core
```

npm

```zsh
npm install @atomic-storage/core
```

pnpm

```zsh
pnpm add @atomic-storage/core
```

## Usage

```typescript
import createStorageAtom from '@atomic-storage/core';

const counterAtom = createStorageAtom({
  key: 'counter',
  initialValue: 0,
  storageController: 'localStorage', //can also use 'sessionStorage'
});

counterAtom.get(); // 0
counterAtom.set(10);
counterAtom.set((v) => v + 1);
```

### Strong Typing

By default the typing of storage atoms is naive, atoms simply trust that any data it parses retrieves and parses from storage will be of the correct type.

If you want a stronger type system, you can use the `middleware` feature to do so.

```typescript
const parseString = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('must be a string');
  }
  return value;
};

const stringAtom = createStorageAtom({
  key: 'string-value',
  initialValue: '',
  storageController: 'localStorage',
  middleware: [parseString],
});
// All values passed to `set` and returned from `get` will parsed through `parseString` and will throw an error if the data is not a string
```

### Subscribe

You can subscribe to an atom to make sure you are always displaying the newest value;

```typescript
const accountBalanceAtom = createStorageAtom({
  key: 'balance',
  initialValue: 0,
  storageController: 'localStorage',
});

const accountBalanceElement = document.getElementById(
  'account-balance-display'
);

if (accountBalanceElement?.innerHTML) {
  accountBalanceElement.innerHTML = accountBalanceAtom.get();
}

accountBalanceAtom.subscribe((newBalance) => {
  if (accountBalanceElement?.innerHTML) {
    accountBalanceElement.innerHTML = newBalance;
  }
});
```

**NOTE:** Subscribing to an atom only subscribes you to updates made _by that atom_. If the value stored at the atom's key is updated either directly or by another atom that targets the same key, those updates will not be broadcast.
