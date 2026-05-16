import { useEffect } from 'react';
import useChallenge from '../store/challengeStore';

export function useChallenge() {
  const store = useChallenge();
  useEffect(() => {
    store.loadChallenge();
  }, []);
  return store;
}
