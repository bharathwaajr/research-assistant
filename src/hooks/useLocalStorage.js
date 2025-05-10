import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue).map(validateNote) : initialValue;
    } catch (error) {
      console.error(`Error reading "${key}" from localStorage:`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(value);
      if (localStorage.getItem(key) !== valueToStore) {
        localStorage.setItem(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error writing "${key}" to localStorage:`, error);
    }
  }, [key, value]);

  return [value, setValue];
}