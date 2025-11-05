import { useState } from "react";
import { Competitor, Bracket } from "@/types/tournament";
import { CompetitorForm } from "@/components/CompetitorForm";
import { CompetitorList } from "@/components/CompetitorList";
import { BracketView } from "@/components/BracketView";
import { generateBrackets } from "@/utils/bracketGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Index = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [brackets, setBrackets] = useState<Bracket[]>([]);

  const handleAddCompetitor = (competitor: Competitor) => {
    setCompetitors((prev) => [...prev, competitor]);
  };

  const handleGenerateBrackets = () => {
    if (competitors.length < 2) {
      toast.error("Se necesitan al menos 2 competidores para generar brackets");
      return;
    }

    const newBrackets = generateBrackets(competitors);
    
    if (newBrackets.length === 0) {
      toast.error("No se pudieron generar brackets. Verifica que haya competidores compatibles.");
      return;
    }

    setBrackets(newBrackets);
    toast.success(`${newBrackets.length} bracket(s) generado(s) exitosamente`);
  };

  const handleSelectWinner = (bracketId: string, matchId: string, winnerId: string) => {
    setBrackets((prevBrackets) => {
      return prevBrackets.map((bracket) => {
        if (bracket.id !== bracketId) return bracket;

        const updatedMatches = [...bracket.matches];
        const matchIndex = updatedMatches.findIndex((m) => m.id === matchId);
        
        if (matchIndex === -1) return bracket;

        const match = updatedMatches[matchIndex];
        const winner = match.competitor1?.id === winnerId ? match.competitor1 : match.competitor2;
        
        if (!winner) return bracket;

        // Update current match with winner
        updatedMatches[matchIndex] = { ...match, winner };

        // Find next round match and assign winner
        const nextRound = match.round + 1;
        const nextPosition = Math.floor(match.position / 2);
        const nextMatchIndex = updatedMatches.findIndex(
          (m) => m.round === nextRound && m.position === nextPosition
        );

        if (nextMatchIndex !== -1) {
          const nextMatch = updatedMatches[nextMatchIndex];
          const isFirstSlot = match.position % 2 === 0;
          
          updatedMatches[nextMatchIndex] = {
            ...nextMatch,
            competitor1: isFirstSlot ? winner : nextMatch.competitor1,
            competitor2: !isFirstSlot ? winner : nextMatch.competitor2,
          };
        }

        toast.success(`${winner.name} avanza a la siguiente ronda`);
        
        return { ...bracket, matches: updatedMatches };
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Torneo de Jiu-Jitsu
          </h1>
          <p className="text-muted-foreground text-lg">
            Sistema de gestión de torneos profesional
          </p>
        </div>

        <Tabs defaultValue="registro" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="registro">Registro</TabsTrigger>
            <TabsTrigger value="competidores">Competidores</TabsTrigger>
            <TabsTrigger value="brackets">Brackets</TabsTrigger>
          </TabsList>

          <TabsContent value="registro" className="space-y-4 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CompetitorForm onAddCompetitor={handleAddCompetitor} />
              <CompetitorList competitors={competitors} />
            </div>
          </TabsContent>

          <TabsContent value="competidores" className="mt-6">
            <div className="flex flex-col items-center gap-6">
              <CompetitorList competitors={competitors} />
              <Button
                onClick={handleGenerateBrackets}
                disabled={competitors.length < 2}
                size="lg"
                className="min-w-[200px]"
              >
                Generar Brackets
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="brackets" className="mt-6">
            <BracketView brackets={brackets} onSelectWinner={handleSelectWinner} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
