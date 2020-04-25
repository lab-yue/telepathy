import { createTelepathy, createTelepathyChannel, useTelepathy } from './index';
import { renderHook, act } from '@testing-library/react-hooks';

describe('telepathy', () => {
  it('creates Telepathy', () => {
    const telepathy = createTelepathy(0);
    const updateCallback = jest.fn();
    const unsubscribe = telepathy.subscribe(updateCallback);

    expect(telepathy.state).toBe(0);
    telepathy.next(1);
    expect(telepathy.state).toBe(1);
    unsubscribe();
    telepathy.next(1);
    expect(updateCallback).toBeCalledWith(1);
  });

  it('creates TelepathyChannel', () => {
    const { telepathy, select, set } = createTelepathyChannel(0);
    const updateTo = set();
    const selectState = select();

    expect(telepathy.state).toBe(0);
    expect(selectState()).toBe(0);

    updateTo(1);
    expect(telepathy.state).toBe(1);
    expect(selectState()).toBe(1);
  });

  it('creates TelepathyChannel reducer and selector', () => {
    const { telepathy, select, set } = createTelepathyChannel({ id: 1, name: 'Newton' });
    const updateName = set((state, payload: string) => ({ ...state, name: payload }));
    const selectId = select((state) => state.id);

    updateName('Einstein');
    expect(telepathy.state).toStrictEqual({ id: 1, name: 'Einstein' });
    expect(selectId()).toBe(1);
  });
});

describe('useTelepathy', () => {
  it('renders telepathy', () => {
    let renderCount = 0;
    const telepathy = createTelepathy(0);
    const { result } = renderHook(() => {
      renderCount++;
      return useTelepathy(telepathy);
    });
    expect(result.current).toBe(0);
    expect(renderCount).toBe(1);
    act(() => {
      telepathy.next(1);
    });
    expect(result.current).toBe(1);
    expect(renderCount).toBe(2);
  });

  it('renders telepathy with select', () => {
    let renderCount = 0;
    const { set, telepathy } = createTelepathyChannel({ id: 1, name: 'Newton' });
    const updateName = set((state, payload: string) => ({ ...state, name: payload }));

    const { result } = renderHook(() => {
      renderCount++;
      return useTelepathy(telepathy, ({ name }) => name);
    });
    expect(result.current).toBe('Newton');
    expect(renderCount).toBe(1);
    act(() => {
      updateName('Einstein');
    });
    expect(result.current).toBe('Einstein');
    expect(renderCount).toBe(2);
  });
});
