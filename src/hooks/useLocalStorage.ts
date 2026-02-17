import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useLocalStorage<
    Array<{
      age: number;
      relationship?: string;
      occasion: string;
      interests: string;
      budget: string;
      timestamp: number;
    }>
  >('recent-searches', []);

  const addSearch = (search: {
    age: number;
    relationship?: string;
    occasion: string;
    interests: string;
    budget: string;
  }) => {
    const newSearch = {
      ...search,
      timestamp: Date.now(),
    };

    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (s) =>
          s.age !== search.age ||
          s.occasion !== search.occasion ||
          s.interests !== search.interests
      );
      return [newSearch, ...filtered].slice(0, 5); // Keep only 5 most recent
    });
  };

  const clearSearches = () => {
    setRecentSearches([]);
  };

  return { recentSearches, addSearch, clearSearches };
}
