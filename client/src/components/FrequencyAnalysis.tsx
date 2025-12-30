/*
 * FrequencyAnalysis Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Display frequency analysis and delay statistics of lottery numbers
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  analyzeFrequency,
  getNumbersByDelay,
  type FrequencyAnalysis as FrequencyAnalysisType,
  type FrequencyData,
} from "@/lib/lotofacilApi";
import { 
  BarChart3, 
  Flame, 
  Snowflake, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
  Hash,
  Clock,
  Hourglass
} from "lucide-react";
import { toast } from "sonner";

interface FrequencyAnalysisProps {
  onSelectNumbers?: (numbers: number[]) => void;
}

export function FrequencyAnalysis({ onSelectNumbers }: FrequencyAnalysisProps) {
  const [analysis, setAnalysis] = useState<FrequencyAnalysisType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contestCount, setContestCount] = useState<string>('50');

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async (count?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeFrequency(count || parseInt(contestCount, 10));
      setAnalysis(data);
    } catch (err) {
      setError('Não foi possível carregar a análise. Verifique sua conexão.');
      toast.error('Erro ao carregar análise de frequência');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContestCountChange = (value: string) => {
    setContestCount(value);
    loadAnalysis(parseInt(value, 10));
  };

  const selectHotNumbers = () => {
    if (analysis && onSelectNumbers) {
      const hot = analysis.frequencies.slice(0, 18).map(f => f.number);
      onSelectNumbers(hot);
      toast.success('18 números mais frequentes selecionados');
    }
  };

  const selectColdNumbers = () => {
    if (analysis && onSelectNumbers) {
      const cold = [...analysis.frequencies]
        .sort((a, b) => a.count - b.count)
        .slice(0, 18)
        .map(f => f.number);
      onSelectNumbers(cold);
      toast.success('18 números menos frequentes selecionados');
    }
  };

  const selectBalanced = () => {
    if (analysis && onSelectNumbers) {
      const hot = analysis.frequencies.slice(0, 9).map(f => f.number);
      const cold = [...analysis.frequencies]
        .sort((a, b) => a.count - b.count)
        .slice(0, 9)
        .map(f => f.number);
      const balanced = Array.from(new Set([...hot, ...cold])).slice(0, 18);
      onSelectNumbers(balanced);
      toast.success('Seleção balanceada aplicada');
    }
  };

  const selectDelayedNumbers = () => {
    if (analysis && onSelectNumbers) {
      const delayed = getNumbersByDelay(analysis, 18);
      onSelectNumbers(delayed);
      toast.success('18 números com maior atraso selecionados');
    }
  };

  const getFrequencyColor = (freq: FrequencyData): string => {
    if (freq.isHot) return 'bg-red-500 text-white';
    if (freq.isCold) return 'bg-blue-500 text-white';
    return 'bg-muted text-foreground';
  };

  const getDelayColor = (freq: FrequencyData, maxDelay: number): string => {
    if (freq.delay === 0) return 'bg-green-500 text-white';
    if (freq.isDelayed) return 'bg-amber-500 text-white';
    const intensity = Math.min(freq.delay / maxDelay, 1);
    if (intensity > 0.5) return 'bg-orange-400 text-white';
    return 'bg-muted text-foreground';
  };

  const getStreakIcon = (streak: number) => {
    if (streak > 0) {
      return <TrendingUp className="w-3 h-3 text-green-500" />;
    } else if (streak < 0) {
      return <TrendingDown className="w-3 h-3 text-red-500" />;
    }
    return null;
  };

  if (isLoading && !analysis) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando análise de frequência...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !analysis) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-destructive">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={() => loadAnalysis()}>
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-primary" />
              Análise de Frequência
            </CardTitle>
            <CardDescription>
              Estatísticas dos últimos {analysis?.totalContests || 0} sorteios
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={contestCount} onValueChange={handleContestCountChange}>
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 sorteios</SelectItem>
                <SelectItem value="50">50 sorteios</SelectItem>
                <SelectItem value="100">100 sorteios</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadAnalysis()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {analysis && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-1 text-[10px] text-red-600 mb-0.5">
                  <Flame className="w-3 h-3" />
                  Quentes
                </div>
                <p className="text-base font-mono font-semibold">{analysis.hotNumbers.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-1 text-[10px] text-blue-600 mb-0.5">
                  <Snowflake className="w-3 h-3" />
                  Frios
                </div>
                <p className="text-base font-mono font-semibold">{analysis.coldNumbers.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1 text-[10px] text-amber-600 mb-0.5">
                  <Clock className="w-3 h-3" />
                  Atrasados
                </div>
                <p className="text-base font-mono font-semibold">{analysis.delayedNumbers.length}</p>
              </div>
              <div className="p-2 rounded-lg bg-muted">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
                  <Hash className="w-3 h-3" />
                  Média
                </div>
                <p className="text-base font-mono font-semibold">{analysis.averageFrequency.toFixed(1)}</p>
              </div>
            </div>

            {/* Quick Select Buttons */}
            {onSelectNumbers && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={selectHotNumbers} className="text-xs">
                  <Flame className="w-3 h-3 mr-1 text-red-500" />
                  Quentes
                </Button>
                <Button variant="outline" size="sm" onClick={selectColdNumbers} className="text-xs">
                  <Snowflake className="w-3 h-3 mr-1 text-blue-500" />
                  Frios
                </Button>
                <Button variant="outline" size="sm" onClick={selectDelayedNumbers} className="text-xs">
                  <Clock className="w-3 h-3 mr-1 text-amber-500" />
                  Atrasados
                </Button>
                <Button variant="outline" size="sm" onClick={selectBalanced} className="text-xs">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Balanceado
                </Button>
              </div>
            )}

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Quente
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                Frio
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Atrasado
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Recente
              </div>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="grid" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="grid">Grade</TabsTrigger>
                <TabsTrigger value="ranking">Ranking</TabsTrigger>
                <TabsTrigger value="delay">Atraso</TabsTrigger>
              </TabsList>
              
              <TabsContent value="grid" className="mt-4">
                {/* Grid View - Numbers 1-25 in order */}
                <div className="grid grid-cols-5 gap-2">
                  {[...Array(25)].map((_, i) => {
                    const num = i + 1;
                    const freq = analysis.frequencies.find(f => f.number === num);
                    if (!freq) return null;
                    
                    return (
                      <Tooltip key={num}>
                        <TooltipTrigger asChild>
                          <div
                            className={`relative p-2 rounded-lg text-center cursor-help transition-all hover:scale-105 ${getFrequencyColor(freq)}`}
                          >
                            <span className="text-lg font-mono font-bold">
                              {num.toString().padStart(2, '0')}
                            </span>
                            <div className="text-[10px] opacity-80">
                              {freq.count}x
                            </div>
                            {freq.streak !== 0 && (
                              <div className="absolute top-0.5 right-0.5">
                                {getStreakIcon(freq.streak)}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <div className="space-y-1">
                            <p className="font-semibold">Dezena {num.toString().padStart(2, '0')}</p>
                            <p>Aparições: {freq.count} ({freq.percentage.toFixed(1)}%)</p>
                            <p>Atraso: {freq.delay} sorteio{freq.delay !== 1 ? 's' : ''}</p>
                            <p>Último sorteio: {freq.lastAppearance}</p>
                            {freq.streak > 0 && <p className="text-green-500">{freq.streak} sorteios seguidos</p>}
                            {freq.streak < 0 && <p className="text-red-500">{Math.abs(freq.streak)} sorteios ausente</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="ranking" className="mt-4">
                {/* Ranking View - Sorted by frequency */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {analysis.frequencies.map((freq, index) => (
                    <div
                      key={freq.number}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="w-6 text-xs text-muted-foreground font-mono">
                        #{index + 1}
                      </span>
                      <span
                        className={`w-8 h-8 flex items-center justify-center text-sm font-mono font-bold rounded-full ${getFrequencyColor(freq)}`}
                      >
                        {freq.number.toString().padStart(2, '0')}
                      </span>
                      <div className="flex-1">
                        <Progress 
                          value={freq.percentage} 
                          className="h-2"
                        />
                      </div>
                      <div className="flex items-center gap-2 min-w-[80px] justify-end">
                        <span className="text-sm font-mono">{freq.count}x</span>
                        <span className="text-xs text-muted-foreground">
                          ({freq.percentage.toFixed(0)}%)
                        </span>
                        {freq.isHot && <Flame className="w-3 h-3 text-red-500" />}
                        {freq.isCold && <Snowflake className="w-3 h-3 text-blue-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="delay" className="mt-4">
                {/* Delay View - Numbers sorted by delay */}
                <div className="space-y-3">
                  {/* Delay Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Média</p>
                      <p className="font-mono font-semibold">{analysis.averageDelay.toFixed(1)}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Máximo</p>
                      <p className="font-mono font-semibold">{analysis.maxDelay}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded-lg">
                      <p className="text-muted-foreground">Atrasados</p>
                      <p className="font-mono font-semibold">{analysis.delayedNumbers.length}</p>
                    </div>
                  </div>

                  {/* Delay Grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {[...Array(25)].map((_, i) => {
                      const num = i + 1;
                      const freq = analysis.frequencies.find(f => f.number === num);
                      if (!freq) return null;
                      
                      return (
                        <Tooltip key={num}>
                          <TooltipTrigger asChild>
                            <div
                              className={`relative p-2 rounded-lg text-center cursor-help transition-all hover:scale-105 ${getDelayColor(freq, analysis.maxDelay)}`}
                            >
                              <span className="text-lg font-mono font-bold">
                                {num.toString().padStart(2, '0')}
                              </span>
                              <div className="text-[10px] opacity-80 flex items-center justify-center gap-0.5">
                                <Hourglass className="w-2.5 h-2.5" />
                                {freq.delay}
                              </div>
                              {freq.isDelayed && (
                                <div className="absolute top-0.5 right-0.5">
                                  <Clock className="w-3 h-3 text-amber-200" />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">Dezena {num.toString().padStart(2, '0')}</p>
                              <p>Atraso: {freq.delay} sorteio{freq.delay !== 1 ? 's' : ''}</p>
                              <p>Último sorteio: {freq.lastAppearance || 'Não apareceu'}</p>
                              <p>Aparições: {freq.count} ({freq.percentage.toFixed(1)}%)</p>
                              {freq.isDelayed && <p className="text-amber-500">Acima da média de atraso</p>}
                              {freq.delay === 0 && <p className="text-green-500">Saiu no último sorteio</p>}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>

                  {/* Delay Ranking */}
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2">
                    {[...analysis.frequencies]
                      .sort((a, b) => b.delay - a.delay)
                      .map((freq, index) => (
                        <div
                          key={freq.number}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <span className="w-5 text-[10px] text-muted-foreground font-mono">
                            #{index + 1}
                          </span>
                          <span
                            className={`w-7 h-7 flex items-center justify-center text-xs font-mono font-bold rounded-full ${getDelayColor(freq, analysis.maxDelay)}`}
                          >
                            {freq.number.toString().padStart(2, '0')}
                          </span>
                          <div className="flex-1">
                            <Progress 
                              value={(freq.delay / analysis.maxDelay) * 100} 
                              className="h-1.5"
                            />
                          </div>
                          <div className="flex items-center gap-1.5 min-w-[60px] justify-end">
                            <Hourglass className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs font-mono">{freq.delay}</span>
                            {freq.isDelayed && <Clock className="w-3 h-3 text-amber-500" />}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Info Footer */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                <strong className="text-amber-500">Atrasados</strong> são números que não saem há mais de 50% acima da média. 
                Números com <strong className="text-green-500">atraso 0</strong> saíram no último sorteio. 
                Análise baseada nos últimos {analysis.totalContests} sorteios (até concurso {analysis.latestContest}).
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
