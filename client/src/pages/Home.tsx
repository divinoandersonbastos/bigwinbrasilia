/*
 * Home Page - Lotofácil Generator
 * Design: Swiss Minimalist Mathematical
 * Features: Number selection, game generation, statistics display
 */

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NumberSelector } from "@/components/NumberSelector";
import { GameCard } from "@/components/GameCard";
import { generateGames, calculateCoverage, type GeneratedGame } from "@/lib/gameGenerator";
import { Dices, RotateCcw, Copy, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [generatedGames, setGeneratedGames] = useState<GeneratedGame[]>([]);
  const [copied, setCopied] = useState(false);

  const handleToggle = (num: number) => {
    setSelectedNumbers(prev => {
      if (prev.includes(num)) {
        return prev.filter(n => n !== num);
      }
      if (prev.length >= 18) return prev;
      return [...prev, num];
    });
    setGeneratedGames([]);
  };

  const handleGenerate = () => {
    if (selectedNumbers.length !== 18) {
      toast.error("Selecione exatamente 18 dezenas");
      return;
    }
    const games = generateGames(selectedNumbers);
    setGeneratedGames(games);
    toast.success("6 jogos gerados com sucesso!");
  };

  const handleReset = () => {
    setSelectedNumbers([]);
    setGeneratedGames([]);
  };

  const handleCopyAll = () => {
    const text = generatedGames
      .map((game, i) => `Jogo ${i + 1}: ${game.numbers.map(n => n.toString().padStart(2, '0')).join(' ')}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Jogos copiados para a área de transferência");
    setTimeout(() => setCopied(false), 2000);
  };

  const coverage = useMemo(() => {
    if (selectedNumbers.length !== 18) return null;
    return calculateCoverage(selectedNumbers);
  }, [selectedNumbers]);

  const removedNumbers = useMemo(() => {
    const all = Array.from({ length: 25 }, (_, i) => i + 1);
    return all.filter(n => !selectedNumbers.includes(n));
  }, [selectedNumbers]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header 
        className="relative border-b border-border overflow-hidden"
        style={{
          backgroundImage: 'url(/images/hero-background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        <div className="container relative py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Gerador Lotofácil
              <span className="block text-primary">18 → 6 Jogos</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Transforme 18 dezenas em 6 jogos otimizados com alta cobertura estatística. 
              Sistema de fechamento que reduz o custo em <span className="font-mono font-semibold text-foreground">136×</span> mantendo 
              excelente probabilidade de acertos.
            </p>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="grid lg:grid-cols-[1fr,380px] gap-8">
          {/* Left Column - Number Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dices className="w-5 h-5 text-primary" />
                  Seleção de Dezenas
                </CardTitle>
                <CardDescription>
                  Escolha 18 das 25 dezenas disponíveis. As 7 dezenas não selecionadas serão excluídas do fechamento.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NumberSelector
                  selectedNumbers={selectedNumbers}
                  onToggle={handleToggle}
                  maxSelection={18}
                />
                
                <div className="flex gap-3 mt-6 pt-6 border-t border-border">
                  <Button
                    onClick={handleGenerate}
                    disabled={selectedNumbers.length !== 18}
                    className="flex-1"
                    size="lg"
                  >
                    Gerar 6 Jogos
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Generated Games */}
            <AnimatePresence mode="wait">
              {generatedGames.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Jogos Gerados</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyAll}
                      className="gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copiado!" : "Copiar Todos"}
                    </Button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    {generatedGames.map((game, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <GameCard
                          gameNumber={index + 1}
                          numbers={game.numbers}
                          stats={game.stats}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Statistics */}
          <aside className="space-y-6">
            {/* Removed Numbers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Dezenas Excluídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {removedNumbers.length === 7 ? (
                  <div className="flex flex-wrap gap-2">
                    {removedNumbers.map(num => (
                      <span
                        key={num}
                        className="w-9 h-9 rounded-full border-2 border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center font-mono text-sm font-medium"
                      >
                        {num.toString().padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecione 18 dezenas para ver as 7 excluídas.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Coverage Stats */}
            {coverage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Estatísticas de Cobertura
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-mono font-bold text-primary">6</p>
                        <p className="text-xs text-muted-foreground uppercase">Jogos</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-mono font-bold">R$ 18</p>
                        <p className="text-xs text-muted-foreground uppercase">Custo Total</p>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-accent/50 rounded-lg">
                      <p className="text-xs text-muted-foreground uppercase mb-1">Média de Aparições</p>
                      <p className="font-mono font-semibold">
                        {coverage.avgAppearances.toFixed(1)}× por número
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Info Card */}
            <Card className="bg-accent/30 border-accent">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Info className="w-4 h-4" />
                  Como Funciona
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  O sistema de <strong className="text-foreground">fechamento</strong> distribui suas 18 dezenas em 6 jogos de forma otimizada.
                </p>
                <p>
                  Cada número aparece em média <strong className="text-foreground">5 jogos</strong>, garantindo alta cobertura com baixo investimento.
                </p>
                <p>
                  Desdobramento completo de 18 números = <strong className="text-foreground">816 jogos</strong>. 
                  Este fechamento reduz para apenas <strong className="text-foreground">6 jogos</strong>.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="container py-6 text-center text-sm text-muted-foreground">
          <p>Ferramenta de apoio matemático. Jogue com responsabilidade.</p>
        </div>
      </footer>
    </div>
  );
}
