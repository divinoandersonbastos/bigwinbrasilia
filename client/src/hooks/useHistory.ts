/*
 * useHistory Hook
 * Manages game history persistence using localStorage
 * Design: Swiss Minimalist Mathematical
 */

import { useState, useEffect, useCallback } from 'react';
import { type GeneratedGame, type FilterOptions } from '@/lib/gameGenerator';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  selectedNumbers: number[];
  games: GeneratedGame[];
  filters: FilterOptions;
  activeFiltersCount: number;
  approvedCount: number;
  rejectedCount: number;
}

const STORAGE_KEY = 'lotofacil-history';
const MAX_HISTORY_ENTRIES = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
  }
  return [];
}

function saveHistory(history: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
  }
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const loaded = loadHistory();
    setHistory(loaded);
    setIsLoaded(true);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      saveHistory(history);
    }
  }, [history, isLoaded]);

  const addEntry = useCallback((
    selectedNumbers: number[],
    games: GeneratedGame[],
    filters: FilterOptions,
    approvedCount: number,
    rejectedCount: number
  ) => {
    const activeFiltersCount = 
      (filters.sumRange.enabled ? 1 : 0) +
      (filters.parityBalance.enabled ? 1 : 0) +
      (filters.primesCount.enabled ? 1 : 0);

    const newEntry: HistoryEntry = {
      id: generateId(),
      timestamp: Date.now(),
      selectedNumbers: [...selectedNumbers].sort((a, b) => a - b),
      games,
      filters,
      activeFiltersCount,
      approvedCount,
      rejectedCount,
    };

    setHistory(prev => {
      const updated = [newEntry, ...prev];
      // Keep only the last MAX_HISTORY_ENTRIES
      return updated.slice(0, MAX_HISTORY_ENTRIES);
    });

    return newEntry.id;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const getEntry = useCallback((id: string) => {
    return history.find(entry => entry.id === id);
  }, [history]);

  return {
    history,
    isLoaded,
    addEntry,
    removeEntry,
    clearHistory,
    getEntry,
  };
}

// Helper function to format timestamp
export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Helper function to format date only
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Helper function to format time only
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
