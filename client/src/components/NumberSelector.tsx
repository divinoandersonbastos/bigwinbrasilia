/*
 * NumberSelector Component
 * Design: Swiss Minimalist Mathematical
 * Purpose: Allow user to select exactly 18 numbers from 25
 */

import { cn } from "@/lib/utils";

interface NumberSelectorProps {
  selectedNumbers: number[];
  onToggle: (num: number) => void;
  maxSelection: number;
}

export function NumberSelector({ selectedNumbers, onToggle, maxSelection }: NumberSelectorProps) {
  const numbers = Array.from({ length: 25 }, (_, i) => i + 1);
  const isMaxReached = selectedNumbers.length >= maxSelection;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Selecione {maxSelection} dezenas
        </h3>
        <span className="font-mono text-lg font-semibold">
          <span className={cn(
            selectedNumbers.length === maxSelection ? "text-primary" : "text-foreground"
          )}>
            {selectedNumbers.length}
          </span>
          <span className="text-muted-foreground">/{maxSelection}</span>
        </span>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {numbers.map((num) => {
          const isSelected = selectedNumbers.includes(num);
          const isDisabled = !isSelected && isMaxReached;
          
          return (
            <button
              key={num}
              onClick={() => onToggle(num)}
              disabled={isDisabled}
              className={cn(
                "number-ball",
                isSelected && "selected"
              )}
              aria-pressed={isSelected}
              aria-label={`Número ${num}${isSelected ? ', selecionado' : ''}`}
            >
              {num.toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
