/*
 * HistoryPanel Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Display and manage saved game history with result checking
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type HistoryEntry, formatDate, formatTime } from "@/hooks/useHistory";
import { ResultChecker } from "@/components/ResultChecker";
import { History, Trash2, Eye, Calendar, Clock, Filter, CheckCircle, XCircle, Trophy } from "lucide-react";

interface HistoryPanelProps {
  history: HistoryEntry[];
  onRemoveEntry: (id: string) => void;
  onClearHistory: () => void;
  onLoadEntry?: (entry: HistoryEntry) => void;
}

export function HistoryPanel({ 
  history, 
  onRemoveEntry, 
  onClearHistory,
  onLoadEntry 
}: HistoryPanelProps) {
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4 text-primary" />
            Histórico de Jogos
          </CardTitle>
          <CardDescription>
            Seus jogos gerados serão salvos aqui
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum jogo salvo ainda</p>
            <p className="text-xs mt-1">Gere jogos para começar a salvar seu histórico</p>
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
              <History className="w-4 h-4 text-primary" />
              Histórico de Jogos
            </CardTitle>
            <CardDescription>
              {history.length} {history.length === 1 ? 'registro salvo' : 'registros salvos'}
            </CardDescription>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Todos os {history.length} registros serão removidos permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={onClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Limpar tudo
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="space-y-2 p-4 pt-0">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="group flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(entry.timestamp)}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(entry.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {entry.approvedCount} {entry.approvedCount === 1 ? 'jogo' : 'jogos'}
                    </Badge>
                    {entry.activeFiltersCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        <Filter className="w-3 h-3 mr-1" />
                        {entry.activeFiltersCount} {entry.activeFiltersCount === 1 ? 'filtro' : 'filtros'}
                      </Badge>
                    )}
                    {entry.rejectedCount > 0 && (
                      <Badge variant="outline" className="text-xs text-amber-600">
                        <XCircle className="w-3 h-3 mr-1" />
                        {entry.rejectedCount} rejeitados
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  {/* Result Checker Button */}
                  <ResultChecker entry={entry} />
                  
                  {/* View Details Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Jogo</DialogTitle>
                        <DialogDescription>
                          {formatDate(entry.timestamp)} às {formatTime(entry.timestamp)}
                        </DialogDescription>
                      </DialogHeader>
                      <ScrollArea className="flex-1 pr-4">
                        <div className="space-y-4">
                          {/* Selected Numbers */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">Dezenas Selecionadas (18)</h4>
                            <div className="flex flex-wrap gap-1">
                              {entry.selectedNumbers.map(n => (
                                <span
                                  key={n}
                                  className="w-8 h-8 flex items-center justify-center text-xs font-mono bg-primary text-primary-foreground rounded-full"
                                >
                                  {n.toString().padStart(2, '0')}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Filters Applied */}
                          {entry.activeFiltersCount > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2">Filtros Aplicados</h4>
                              <div className="flex flex-wrap gap-2">
                                {entry.filters.sumRange.enabled && (
                                  <Badge variant="outline">
                                    Soma: {entry.filters.sumRange.min}-{entry.filters.sumRange.max}
                                  </Badge>
                                )}
                                {entry.filters.parityBalance.enabled && (
                                  <Badge variant="outline">
                                    Pares: {entry.filters.parityBalance.minEvens}-{entry.filters.parityBalance.maxEvens}
                                  </Badge>
                                )}
                                {entry.filters.primesCount.enabled && (
                                  <Badge variant="outline">
                                    Primos: {entry.filters.primesCount.min}-{entry.filters.primesCount.max}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Games */}
                          <div>
                            <h4 className="text-sm font-medium mb-2">
                              Jogos Gerados ({entry.approvedCount} aprovados)
                            </h4>
                            <div className="grid gap-3">
                              {entry.games.map((game, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 rounded-lg border border-border bg-muted/30"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-muted-foreground">
                                      JOGO {idx + 1}
                                    </span>
                                    <span className="text-xs font-mono text-muted-foreground">
                                      Σ {game.stats.sum}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {game.numbers.map(n => (
                                      <span
                                        key={n}
                                        className="w-7 h-7 flex items-center justify-center text-xs font-mono bg-primary text-primary-foreground rounded-full"
                                      >
                                        {n.toString().padStart(2, '0')}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span>Pares: {game.stats.evens}</span>
                                    <span>Ímpares: {game.stats.odds}</span>
                                    <span>Primos: {game.stats.primes}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                      <DialogFooter className="mt-4">
                        {onLoadEntry && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              onLoadEntry(entry);
                            }}
                          >
                            Carregar Dezenas
                          </Button>
                        )}
                        <DialogClose asChild>
                          <Button variant="secondary">Fechar</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Delete Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover registro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Este registro será removido permanentemente do histórico.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onRemoveEntry(entry.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
