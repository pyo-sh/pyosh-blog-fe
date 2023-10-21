export default function throttle<T extends unknown[]>(
  fn: (...args: T) => unknown,
  cycle?: number,
) {
  let executed = false;

  function execution(this: unknown, ...args: T) {
    if (!executed) {
      executed = true;

      setTimeout(() => {
        fn.apply(this, args);
        executed = false;
      }, cycle);
    }
  }

  return execution;
}
