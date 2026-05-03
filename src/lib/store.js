import { useState, useEffect } from 'react';

const state = {
  statusNotes: 'idle',
  statusFlashcards: 'idle',
  statusQuiz: 'idle'
};

const listeners = new Set();

export const updateGenStatus = (key, val) => {
  state[key] = val;
  listeners.forEach(listener => listener());
};

export const useGenState = () => {
  const [, setTick] = useState(0);
  
  useEffect(() => {
    const listener = () => setTick(t => t + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);
  
  return state;
};
