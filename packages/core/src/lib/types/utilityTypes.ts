export type SetOptional<Obj, Key extends keyof Obj> = Omit<Obj, Key> &
  Partial<Pick<Obj, Key>>;

export type UpdateDeriver<Value> = (p: Value) => Value;
export type Update<Value> = UpdateDeriver<Value> | Value;
