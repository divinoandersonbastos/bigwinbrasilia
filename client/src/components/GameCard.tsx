/*
 * GameCard Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Display a single generated game with statistics
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GameStats {
  evens: number;
  odds: number;
  primes: number;
  sum: number;
}

interface GameCardProps {
  gameNumber: number;
  numbers: number[];
  stats: GameStats;
}

export function GameCard({ gameNumber, numbers, stats }: GameCardProps) {
  return (
    <Card className="border-2 hover:border-primary/30 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Jogo {gameNumber}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Σ {stats.sum}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {numbers.map((num, idx) => (
            <span
              key={idx}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center font-mono text-sm font-medium",
                "bg-primary text-primary-foreground"
              )}
            >
              {num.toString().padStart(2, '0')}
            </span>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pares</p>
            <p className="font-mono font-semibold">{stats.evens}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Ímpares</p>
            <p className="font-mono font-semibold">{stats.odds}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Primos</p>
            <p className="font-mono font-semibold">{stats.primes}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
