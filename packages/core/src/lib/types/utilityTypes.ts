export type Updater<Value> = (p: Value) => Value;

export type SetOptional<Obj, Key extends keyof Obj> = Omit<Obj, Key> &
  Partial<Pick<Obj, Key>>;
