// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isPromise = (value: any | Promise<any>): value is Promise<any> =>
  typeof value === 'object' &&
  'then' in value &&
  typeof value?.then === 'function';
