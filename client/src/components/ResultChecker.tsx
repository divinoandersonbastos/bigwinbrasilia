/*
 * ResultChecker Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Check games against real lottery results
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  fetchLatestResult,
  fetchResultByContest,
  checkGameAgainstResult,
  getMatchingNumbers,
  getPrizeTier,
  formatPrize,
  type LotofacilResult
} from "@/lib/lotofacilApi";
import { type HistoryEntry } from "@/hooks/useHistory";
import { 
  Trophy, 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Hash,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ResultCheckerProps {
  entry: HistoryEntry;
}

interface CheckResult {
  gameIndex: number;
  gameNumbers: number[];
  matches: number;
  matchingNumbers: number[];
  tier: { faixa: string; descricao: string };
  prizeValue: number;
}

export function ResultChecker({ entry }: ResultCheckerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<LotofacilResult | null>(null);
  const [selectedResult, setSelectedResult] = useState<LotofacilResult | null>(null);
  const [contestInput, setContestInput] = useState<string>('');
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);

  // Fetch latest result when dialog opens
  useEffect(() => {
    if (isOpen && !latestResult) {
      loadLatestResult();
    }
  }, [isOpen]);

  const loadLatestResult = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchLatestResult();
      setLatestResult(result);
      setSelectedResult(result);
      checkGames(result);
    } catch (err) {
      setError('Não foi possível carregar os resultados. Verifique sua conexão.');
      toast.error('Erro ao carregar resultados');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecificContest = async (contestNumber: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchResultByContest(contestNumber);
      setSelectedResult(result);
      checkGames(result);
      toast.success(`Concurso ${contestNumber} carregado`);
    } catch (err) {
      setError(`Concurso ${contestNumber} não encontrado.`);
      toast.error('Concurso não encontrado');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGames = (result: LotofacilResult) => {
    const resultNumbers = result.listaDezenas.map(d => parseInt(d, 10));
    
    const results: CheckResult[] = entry.games.map((game, index) => {
      const matches = checkGameAgainstResult(game.numbers, resultNumbers);
      const matchingNumbers = getMatchingNumbers(game.numbers, resultNumbers);
      const tier = getPrizeTier(matches);
      
      // Find prize value
      const prizeInfo = result.listaRateioPremio?.find(p => p.faixa === (16 - matches));
      const prizeValue = matches >= 11 ? (prizeInfo?.valorPremio || 0) : 0;
      
      return {
        gameIndex: index,
        gameNumbers: game.numbers,
        matches,
        matchingNumbers,
        tier,
        prizeValue
      };
    });
    
    setCheckResults(results);
  };

  const handleContestSearch = () => {
    const num = parseInt(contestInput, 10);
    if (isNaN(num) || num < 1) {
      toast.error('Digite um número de concurso válido');
      return;
    }
    loadSpecificContest(num);
  };

  const getBadgeVariant = (matches: number): "default" | "secondary" | "destructive" | "outline" => {
    if (matches >= 14) return "default";
    if (matches >= 11) return "secondary";
    return "outline";
  };

  const getMatchColor = (matches: number): string => {
    if (matches >= 15) return "text-yellow-500";
    if (matches >= 14) return "text-green-500";
    if (matches >= 11) return "text-blue-500";
    return "text-muted-foreground";
  };

  const totalPrize = checkResults.reduce((sum, r) => sum + r.prizeValue, 0);
  const bestResult = checkResults.reduce((best, r) => r.matches > best.matches ? r : best, checkResults[0]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Trophy className="w-3 h-3" />
          Conferir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Conferir Resultados
          </DialogTitle>
          <DialogDescription>
            Compare seus jogos com os resultados oficiais da Lotofácil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Contest Selector */}
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Número do Concurso</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={contestInput}
                  onChange={(e) => setContestInput(e.target.value)}
                  placeholder={latestResult ? `Último: ${latestResult.numero}` : 'Ex: 3574'}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleContestSearch}
                  disabled={isLoading}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLatestResult}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 rounded-lg text-destructive">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {selectedResult && !isLoading && !error && (
            <>
              {/* Contest Info */}
              <Card className="bg-muted/50">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono font-semibold">Concurso {selectedResult.numero}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {selectedResult.dataApuracao}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedResult.listaDezenas.map(d => (
                      <span
                        key={d}
                        className="w-7 h-7 flex items-center justify-center text-xs font-mono bg-primary text-primary-foreground rounded-full"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              {checkResults.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  <Card className="bg-accent/30">
                    <CardContent className="py-3 text-center">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Melhor Resultado</p>
                      <p className={`text-2xl font-mono font-bold ${getMatchColor(bestResult?.matches || 0)}`}>
                        {bestResult?.matches || 0} acertos
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-accent/30">
                    <CardContent className="py-3 text-center">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Prêmio Total</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatPrize(totalPrize)}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Game Results */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 pr-4">
                  {checkResults.map((result) => (
                    <Card 
                      key={result.gameIndex}
                      className={result.matches >= 11 ? 'border-green-500/50 bg-green-500/5' : ''}
                    >
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            JOGO {result.gameIndex + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant={getBadgeVariant(result.matches)}>
                              {result.matches} acertos
                            </Badge>
                            {result.matches >= 11 && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                {result.tier.faixa}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {result.gameNumbers.map(n => {
                            const isMatch = result.matchingNumbers.includes(n);
                            return (
                              <span
                                key={n}
                                className={`w-7 h-7 flex items-center justify-center text-xs font-mono rounded-full transition-all ${
                                  isMatch 
                                    ? 'bg-green-500 text-white ring-2 ring-green-300' 
                                    : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {n.toString().padStart(2, '0')}
                              </span>
                            );
                          })}
                        </div>
                        {result.prizeValue > 0 && (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            Prêmio: {formatPrize(result.prizeValue)}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="secondary">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
