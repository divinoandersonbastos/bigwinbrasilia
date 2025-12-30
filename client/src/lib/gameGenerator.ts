/*
 * Game Generator Logic
 * Implements the 18-to-6 wheeling system for Lotofácil
 * Based on mathematical coverage optimization
 * 
 * Design: Swiss Minimalist Mathematical
 * Features: Wheeling matrix, statistical filters (sum range, parity balance, primes count)
 */

const PRIMES = new Set([2, 3, 5, 7, 11, 13, 17, 19, 23]);

export interface GameStats {
  evens: number;
  odds: number;
  primes: number;
  sum: number;
}

export interface GeneratedGame {
  numbers: number[];
  stats: GameStats;
}

export interface FilterOptions {
  sumRange: {
    enabled: boolean;
    min: number;
    max: number;
  };
  parityBalance: {
    enabled: boolean;
    minEvens: number;
    maxEvens: number;
  };
  primesCount: {
    enabled: boolean;
    min: number;
    max: number;
  };
}

export const DEFAULT_FILTERS: FilterOptions = {
  sumRange: {
    enabled: false,
    min: 150,
    max: 220,
  },
  parityBalance: {
    enabled: false,
    minEvens: 6,
    maxEvens: 9,
  },
  primesCount: {
    enabled: false,
    min: 4,
    max: 7,
  },
};

// Statistical ranges based on historical Lotofácil data
export const STATISTICAL_RANGES = {
  sum: {
    min: 150,
    max: 250,
    optimal: { min: 180, max: 220 },
  },
  evens: {
    min: 0,
    max: 15,
    optimal: { min: 6, max: 9 },
  },
  primes: {
    min: 0,
    max: 9, // Max primes in 1-25 range: 2,3,5,7,11,13,17,19,23
    optimal: { min: 4, max: 7 },
  },
};

// List of prime numbers in Lotofácil range (1-25)
export const PRIME_NUMBERS = [2, 3, 5, 7, 11, 13, 17, 19, 23];

function isPrime(n: number): boolean {
  return PRIMES.has(n);
}

function analyzeGame(game: number[]): GameStats {
  const evens = game.filter(n => n % 2 === 0).length;
  const odds = 15 - evens;
  const primes = game.filter(n => isPrime(n)).length;
  const sum = game.reduce((a, b) => a + b, 0);
  return { evens, odds, primes, sum };
}

// Wheeling matrix: indices (0-17) for each of the 6 games
// Designed to maximize coverage across all 18 selected numbers
const WHEELING_MATRIX = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 15, 16, 17, 10, 11],
  [0, 1, 2, 3, 4, 10, 11, 12, 13, 14, 15, 16, 17, 5, 6],
  [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 0, 1],
  [0, 2, 4, 6, 8, 10, 12, 14, 16, 1, 3, 5, 7, 9, 11],
  [1, 3, 5, 7, 9, 11, 13, 15, 17, 0, 2, 4, 6, 8, 10]
];

export function generateGames(selected18: number[]): GeneratedGame[] {
  if (selected18.length !== 18) {
    throw new Error("Exatamente 18 dezenas são necessárias");
  }

  const sorted = [...selected18].sort((a, b) => a - b);
  
  return WHEELING_MATRIX.map(indices => {
    const numbers = indices.map(i => sorted[i]).sort((a, b) => a - b);
    const stats = analyzeGame(numbers);
    return { numbers, stats };
  });
}

export function filterGames(games: GeneratedGame[], filters: FilterOptions): GeneratedGame[] {
  return games.filter(game => {
    // Filter by sum range
    if (filters.sumRange.enabled) {
      if (game.stats.sum < filters.sumRange.min || game.stats.sum > filters.sumRange.max) {
        return false;
      }
    }

    // Filter by parity balance
    if (filters.parityBalance.enabled) {
      if (game.stats.evens < filters.parityBalance.minEvens || game.stats.evens > filters.parityBalance.maxEvens) {
        return false;
      }
    }

    // Filter by primes count
    if (filters.primesCount.enabled) {
      if (game.stats.primes < filters.primesCount.min || game.stats.primes > filters.primesCount.max) {
        return false;
      }
    }

    return true;
  });
}

export function generateFilteredGames(selected18: number[], filters: FilterOptions): {
  allGames: GeneratedGame[];
  filteredGames: GeneratedGame[];
  rejectedCount: number;
} {
  const allGames = generateGames(selected18);
  const filteredGames = filterGames(allGames, filters);
  
  return {
    allGames,
    filteredGames,
    rejectedCount: allGames.length - filteredGames.length,
  };
}

export function calculateCoverage(selected18: number[]): {
  numberFrequency: Map<number, number>;
  avgAppearances: number;
} {
  const frequency = new Map<number, number>();
  selected18.forEach(n => frequency.set(n, 0));
  
  const games = generateGames(selected18);
  games.forEach(game => {
    game.numbers.forEach(n => {
      frequency.set(n, (frequency.get(n) || 0) + 1);
    });
  });
  
  const total = Array.from(frequency.values()).reduce((a, b) => a + b, 0);
  const avgAppearances = total / 18;
  
  return { numberFrequency: frequency, avgAppearances };
}

// Helper to get filter status description
export function getFilterDescription(filters: FilterOptions): string[] {
  const descriptions: string[] = [];
  
  if (filters.sumRange.enabled) {
    descriptions.push(`Soma: ${filters.sumRange.min} - ${filters.sumRange.max}`);
  }
  
  if (filters.parityBalance.enabled) {
    const minOdds = 15 - filters.parityBalance.maxEvens;
    const maxOdds = 15 - filters.parityBalance.minEvens;
    descriptions.push(`Pares: ${filters.parityBalance.minEvens}-${filters.parityBalance.maxEvens} | Ímpares: ${minOdds}-${maxOdds}`);
  }

  if (filters.primesCount.enabled) {
    descriptions.push(`Primos: ${filters.primesCount.min}-${filters.primesCount.max}`);
  }
  
  return descriptions;
}
