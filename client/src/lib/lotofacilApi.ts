/*
 * Lotofácil API Service
 * Fetches lottery results from the Caixa API
 * API Source: https://api.guidi.dev.br/loteria
 */

export interface LotofacilResult {
  numero: number;
  dataApuracao: string;
  listaDezenas: string[];
  dezenasSorteadasOrdemSorteio: string[];
  acumulado: boolean;
  valorAcumuladoProximoConcurso: number;
  valorEstimadoProximoConcurso: number;
  listaRateioPremio: PrizeBreakdown[];
}

export interface PrizeBreakdown {
  descricaoFaixa: string;
  faixa: number;
  numeroDeGanhadores: number;
  valorPremio: number;
}

export interface GameCheckResult {
  concurso: number;
  data: string;
  dezenasSorteadas: number[];
  acertos: number;
  premio: string;
  faixa: string;
}

const API_BASE_URL = 'https://api.guidi.dev.br/loteria/lotofacil';

// Cache for API results to avoid repeated requests
const resultsCache = new Map<number | 'ultimo', { data: LotofacilResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

/**
 * Fetch the latest lottery result
 */
export async function fetchLatestResult(): Promise<LotofacilResult> {
  const cached = resultsCache.get('ultimo');
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/ultimo`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    resultsCache.set('ultimo', { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error('Error fetching latest result:', error);
    throw error;
  }
}

/**
 * Fetch a specific lottery result by contest number
 */
export async function fetchResultByContest(contestNumber: number): Promise<LotofacilResult> {
  const cached = resultsCache.get(contestNumber);
  if (cached && isCacheValid(cached.timestamp)) {
    return cached.data;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${contestNumber}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    resultsCache.set(contestNumber, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error(`Error fetching contest ${contestNumber}:`, error);
    throw error;
  }
}

/**
 * Fetch multiple recent results
 */
export async function fetchRecentResults(count: number = 10): Promise<LotofacilResult[]> {
  try {
    const latest = await fetchLatestResult();
    const latestNumber = latest.numero;
    
    const promises: Promise<LotofacilResult>[] = [Promise.resolve(latest)];
    
    for (let i = 1; i < count; i++) {
      promises.push(fetchResultByContest(latestNumber - i));
    }
    
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Error fetching recent results:', error);
    throw error;
  }
}

/**
 * Check a game against a specific lottery result
 */
export function checkGameAgainstResult(
  gameNumbers: number[],
  resultNumbers: number[]
): number {
  const resultSet = new Set(resultNumbers);
  return gameNumbers.filter(n => resultSet.has(n)).length;
}

/**
 * Get prize tier based on number of matches
 */
export function getPrizeTier(matches: number): { faixa: string; descricao: string } {
  switch (matches) {
    case 15:
      return { faixa: '1ª Faixa', descricao: '15 acertos - PRÊMIO PRINCIPAL' };
    case 14:
      return { faixa: '2ª Faixa', descricao: '14 acertos' };
    case 13:
      return { faixa: '3ª Faixa', descricao: '13 acertos' };
    case 12:
      return { faixa: '4ª Faixa', descricao: '12 acertos' };
    case 11:
      return { faixa: '5ª Faixa', descricao: '11 acertos' };
    default:
      return { faixa: 'Sem prêmio', descricao: `${matches} acertos` };
  }
}

/**
 * Format prize value
 */
export function formatPrize(value: number): string {
  if (value === 0) return 'Sem prêmio';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Parse date string from API (DD/MM/YYYY) to Date object
 */
export function parseApiDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Check games against multiple results
 */
export async function checkGamesAgainstResults(
  games: number[][],
  resultsCount: number = 5
): Promise<Map<number, GameCheckResult[]>> {
  const results = await fetchRecentResults(resultsCount);
  const checksMap = new Map<number, GameCheckResult[]>();

  games.forEach((game, gameIndex) => {
    const gameChecks: GameCheckResult[] = [];
    
    results.forEach(result => {
      const resultNumbers = result.listaDezenas.map(d => parseInt(d, 10));
      const matches = checkGameAgainstResult(game, resultNumbers);
      const tier = getPrizeTier(matches);
      
      // Find prize value for this tier
      const prizeInfo = result.listaRateioPremio?.find(p => p.faixa === (16 - matches));
      const prizeValue = prizeInfo?.valorPremio || 0;
      
      gameChecks.push({
        concurso: result.numero,
        data: result.dataApuracao,
        dezenasSorteadas: resultNumbers,
        acertos: matches,
        premio: formatPrize(matches >= 11 ? prizeValue : 0),
        faixa: tier.faixa
      });
    });
    
    checksMap.set(gameIndex, gameChecks);
  });

  return checksMap;
}

/**
 * Get matching numbers between a game and result
 */
export function getMatchingNumbers(
  gameNumbers: number[],
  resultNumbers: number[]
): number[] {
  const resultSet = new Set(resultNumbers);
  return gameNumbers.filter(n => resultSet.has(n));
}
