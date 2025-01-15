import { useCallback, useMemo } from 'react';

/**
 * Local Storage Model
 */
export const useLocalStorage = (key: string, version: number) => {
  const get = useCallback(async () => {
    const json = window.localStorage.getItem(key);
    if (json) {
      const parsed = JSON.parse(json);

      if (parsed?.version === version) {
        console.log("parsed.data is: ", parsed);
        return parsed.data;
      }

      return undefined;
    }

    return undefined;
  }, [key, version]);

  /**
   * Update
   */
  const update = useCallback(
    async <T>(data: T) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          version,
          data,
        })
      );
      return data;
    },
    [key, version]
  );

  return useMemo(
    () => ({
      get,
      update,
    }),
    [get, update]
  );
};
