/*
 * FilterPanel Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Allow users to configure statistical filters for game generation
 * Filters: Sum range, Parity balance, Primes count
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { type FilterOptions, STATISTICAL_RANGES, PRIME_NUMBERS } from "@/lib/gameGenerator";
import { Filter, TrendingUp, Scale, Hash } from "lucide-react";

interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const handleSumRangeToggle = (enabled: boolean) => {
    onFiltersChange({
      ...filters,
      sumRange: { ...filters.sumRange, enabled },
    });
  };

  const handleSumRangeChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      sumRange: { ...filters.sumRange, min: values[0], max: values[1] },
    });
  };

  const handleParityToggle = (enabled: boolean) => {
    onFiltersChange({
      ...filters,
      parityBalance: { ...filters.parityBalance, enabled },
    });
  };

  const handleParityChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      parityBalance: { ...filters.parityBalance, minEvens: values[0], maxEvens: values[1] },
    });
  };

  const handlePrimesToggle = (enabled: boolean) => {
    onFiltersChange({
      ...filters,
      primesCount: { ...filters.primesCount, enabled },
    });
  };

  const handlePrimesChange = (values: number[]) => {
    onFiltersChange({
      ...filters,
      primesCount: { ...filters.primesCount, min: values[0], max: values[1] },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="w-4 h-4 text-primary" />
          Filtros Estatísticos
        </CardTitle>
        <CardDescription>
          Refine os jogos com base em critérios probabilísticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sum Range Filter */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="sum-filter" className="font-medium">
                Faixa de Soma
              </Label>
            </div>
            <Switch
              id="sum-filter"
              checked={filters.sumRange.enabled}
              onCheckedChange={handleSumRangeToggle}
            />
          </div>
          
          {filters.sumRange.enabled && (
            <div className="space-y-3 pl-6">
              <Slider
                value={[filters.sumRange.min, filters.sumRange.max]}
                onValueChange={handleSumRangeChange}
                min={STATISTICAL_RANGES.sum.min}
                max={STATISTICAL_RANGES.sum.max}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="font-mono text-muted-foreground">
                  Min: <span className="text-foreground font-semibold">{filters.sumRange.min}</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  Max: <span className="text-foreground font-semibold">{filters.sumRange.max}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faixa ideal: {STATISTICAL_RANGES.sum.optimal.min} - {STATISTICAL_RANGES.sum.optimal.max}
              </p>
            </div>
          )}
        </div>

        {/* Parity Balance Filter */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="parity-filter" className="font-medium">
                Equilíbrio Par/Ímpar
              </Label>
            </div>
            <Switch
              id="parity-filter"
              checked={filters.parityBalance.enabled}
              onCheckedChange={handleParityToggle}
            />
          </div>
          
          {filters.parityBalance.enabled && (
            <div className="space-y-3 pl-6">
              <Slider
                value={[filters.parityBalance.minEvens, filters.parityBalance.maxEvens]}
                onValueChange={handleParityChange}
                min={STATISTICAL_RANGES.evens.min}
                max={STATISTICAL_RANGES.evens.max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <div className="font-mono">
                  <span className="text-muted-foreground">Pares: </span>
                  <span className="text-foreground font-semibold">
                    {filters.parityBalance.minEvens} - {filters.parityBalance.maxEvens}
                  </span>
                </div>
                <div className="font-mono">
                  <span className="text-muted-foreground">Ímpares: </span>
                  <span className="text-foreground font-semibold">
                    {15 - filters.parityBalance.maxEvens} - {15 - filters.parityBalance.minEvens}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Faixa ideal de pares: {STATISTICAL_RANGES.evens.optimal.min} - {STATISTICAL_RANGES.evens.optimal.max}
              </p>
            </div>
          )}
        </div>

        {/* Primes Count Filter */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <Label htmlFor="primes-filter" className="font-medium">
                Números Primos
              </Label>
            </div>
            <Switch
              id="primes-filter"
              checked={filters.primesCount.enabled}
              onCheckedChange={handlePrimesToggle}
            />
          </div>
          
          {filters.primesCount.enabled && (
            <div className="space-y-3 pl-6">
              <Slider
                value={[filters.primesCount.min, filters.primesCount.max]}
                onValueChange={handlePrimesChange}
                min={STATISTICAL_RANGES.primes.min}
                max={STATISTICAL_RANGES.primes.max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span className="font-mono text-muted-foreground">
                  Min: <span className="text-foreground font-semibold">{filters.primesCount.min}</span>
                </span>
                <span className="font-mono text-muted-foreground">
                  Max: <span className="text-foreground font-semibold">{filters.primesCount.max}</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Faixa ideal: {STATISTICAL_RANGES.primes.optimal.min} - {STATISTICAL_RANGES.primes.optimal.max} primos
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {PRIME_NUMBERS.map(p => (
                  <span
                    key={p}
                    className="px-2 py-0.5 text-xs font-mono bg-accent rounded"
                  >
                    {p.toString().padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
