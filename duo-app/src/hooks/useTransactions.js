import { useEffect } from 'react';
import useTransactionStore from '../store/transactionStore';

export function useTransactions() {
  const store = useTransactionStore();
  useEffect(() => {
    if (!store.transactions.length) store.loadTransactions();
  }, []);
  return store;
}
