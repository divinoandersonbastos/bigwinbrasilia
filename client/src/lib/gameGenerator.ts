/*
 * Game Generator Logic
 * Implements the 18-to-6 wheeling system for Lotofácil
 * Based on mathematical coverage optimization
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
