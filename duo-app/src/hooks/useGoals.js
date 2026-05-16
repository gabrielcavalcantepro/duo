import { useEffect } from 'react';
import useGoalStore from '../store/goalStore';

export function useGoals() {
  const store = useGoalStore();
  useEffect(() => {
    store.loadGoals();
  }, []);
  return store;
}
