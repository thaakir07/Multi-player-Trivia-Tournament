import {useState, useEffect} from 'react';

function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const jsonValue = localStorage.getItem(key);
      if (jsonValue !== null) return JSON.parse(jsonValue);
      if (typeof initialValue === 'function') {
        return (initialValue as () => T)();
      } else {
        return initialValue;
      }
    } catch (error) {
      console.log("Error parsing local storage:", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.log("Error saving to local storage:", error);
    }
  }, [key, value]);

  return [value, setValue] as [T, typeof setValue];

}

export default useLocalStorage;