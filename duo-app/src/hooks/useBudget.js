import { useEffect } from 'react';
import useBudgetStore from '../store/budgetStore';

export function useBudget() {
  const store = useBudgetStore();
  useEffect(() => {
    store.loadBudgets();
  }, []);
  return store;
}
