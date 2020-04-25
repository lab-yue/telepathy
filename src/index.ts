import { useEffect, useState } from 'react';

export type Reducer<S, P = any> = (state: S, payload: P) => S;
export type Selector<S, T = S> = (s: S) => T;

export const basicSelector = <S>(s: S): S => s;
export const basicReducer = <S>(_: S, payload: S): S => payload;
export const mergeReducer = <S>(s: S, payload: Partial<S>): S => ({ ...s, ...payload });

export type Telepathy<S> = {
  state: S;
  next: (data: S) => void;
  subscribe: (listener: (data: S) => void) => () => void;
};
/**
 *
 * @param initialState initialState to maintain
 * @param name for custom event default to 'telepathy'
 *
 * returns a `Telepathy` object which you can update and subscribe to
 *
 * @example
 * ```
 * const counts = createTelepathy(0);
 * console.log(counts.state); // 0
 *
 * const unsubscribe = counts.subscribe((count) => console.log(count));
 *
 * counts.next(1);
 * console.log(counts.state); // 1
 * // 1 fom subscription
 * unsubscribe();
 * ```
 */
export function createTelepathy<S>(initialState: S, name: string = 'telepathy'): Telepathy<S> {
  let state = initialState;
  const next = (data: S) => {
    state = data;
    const e = new CustomEvent(name, { detail: data });
    dispatchEvent(e);
  };

  const subscribe = (listener: (data: S) => void) => {
    const customEventListener = (data: Event) => listener((data as CustomEvent<S>).detail);
    addEventListener(name, customEventListener);
    return () => removeEventListener(name, customEventListener);
  };

  return {
    get state() {
      return state;
    },
    next,
    subscribe
  };
}

/**
 *
 * @param initialState initialState to maintain
 * @param name for custom event default to 'telepathy'
 *
 * returns `set` and `select` function to create reducer and selector hook
 *
 * @example
 * ```
 * const { telepathy, set } = createTelepathyChannel({ id: 1, name: 'Newton' });
 * const updateName = set((state, payload: string) => ({ ...state, name: payload }));
 *
 * updateName('Einstein');
 * console.log(telepathy.state); // { id: 1, name: 'Einstein' }
 * ```
 */
export function createTelepathyChannel<S>(initialState: S, name: string = 'telepathy') {
  const telepathy = createTelepathy(initialState, name);

  const set = <P = S>(reducer: Reducer<S, P> = basicReducer as Reducer<S, P>) => {
    return (payload: P) => telepathy.next(reducer(telepathy.state, payload));
  };

  const select = <T = S>(selector: Selector<S, T> = basicSelector as Selector<S, T>) => () =>
    useTelepathy(telepathy, selector);

  return { telepathy, set, select };
}

/**
 *
 * @param telepathy
 * @param selector
 *
 * use selected data
 *
 * @example
 * ```tsx
 * const counts = createTelepathy(0);
 *
 * const Counter = () => {
 *   const count = useTelepathy(counts);
 *   return <>{count}</>;
 * };
 * ```
 *
 * with selector
 * @example
 * ```tsx
 * const physicist = createTelepathy({ name: 'Newton', id: 1 });
 *
 * const Name = () => {
 *   const name = useTelepathy(physicist, ({ name }) => name);
 *   return <>{name}</>;
 * };
 * ```
 */
export function useTelepathy<S, T = S>(
  telepathy: Telepathy<S>,
  selector: Selector<S, T> = basicSelector as Selector<S, T>
) {
  const [value, setValue] = useState<T>(selector(telepathy.state));

  useEffect(() => {
    const unsubscribe = telepathy.subscribe((x) => {
      const selected = selector(x);
      if (!shallowEqual(selected, value)) {
        setValue(selected);
      }
    });
    return () => unsubscribe();
  }, [value]);
  return value;
}

// from react-redux
/* istanbul ignore next */

export const shallowEqual = (objA: any, objB: any): boolean => {
  if (Object.is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !Object.is(objA[keysA[i]], objB[keysA[i]])) {
      return false;
    }
  }

  return true;
};
