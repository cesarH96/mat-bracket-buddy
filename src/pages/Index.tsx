import { useState, useEffect } from "react";
import { Competitor, Bracket, Belt } from "@/types/tournament";
import { CompetitorForm } from "@/components/CompetitorForm";
import { CompetitorList } from "@/components/CompetitorList";
import { BracketView } from "@/components/BracketView";
import { generateBrackets } from "@/utils/bracketGenerator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [brackets, setBrackets] = useState<Bracket[]>([]);

  // Load competitors from database on mount
  useEffect(() => {
    loadCompetitors();
    loadBrackets();
  }, []);

  const loadCompetitors = async () => {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading competitors:', error);
      return;
    }

    if (data) {
      setCompetitors(data as Competitor[]);
    }
  };

  const loadBrackets = async () => {
    const { data: bracketsData, error: bracketsError } = await supabase
      .from('brackets')
      .select('*')
      .order('created_at', { ascending: true });

    if (bracketsError) {
      console.error('Error loading brackets:', bracketsError);
      return;
    }

    if (!bracketsData || bracketsData.length === 0) return;

    // Load matches for each bracket
    const loadedBrackets: Bracket[] = [];

    for (const bracket of bracketsData) {
      const { data: matchesData, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('bracket_id', bracket.id)
        .order('round', { ascending: true });

      if (matchesError) {
        console.error('Error loading matches:', matchesError);
        continue;
      }

      // Get all competitor IDs from matches
      const competitorIds = new Set<string>();
      matchesData?.forEach((match) => {
        if (match.competitor1_id) competitorIds.add(match.competitor1_id);
        if (match.competitor2_id) competitorIds.add(match.competitor2_id);
        if (match.winner_id) competitorIds.add(match.winner_id);
      });

      // Load competitors for this bracket
      const { data: competitorsData } = await supabase
        .from('competitors')
        .select('*')
        .in('id', Array.from(competitorIds));

      const competitorsMap = new Map(
        competitorsData?.map((c) => [c.id, c as Competitor])
      );

      const matches = matchesData?.map((match) => ({
        id: match.id,
        round: match.round,
        position: match.match_number,
        competitor1: match.competitor1_id ? competitorsMap.get(match.competitor1_id) : undefined,
        competitor2: match.competitor2_id ? competitorsMap.get(match.competitor2_id) : undefined,
        winner: match.winner_id ? competitorsMap.get(match.winner_id) : undefined,
      })) || [];

      loadedBrackets.push({
        id: bracket.id,
        ageGroup: bracket.age_group,
        weightGroup: bracket.weight_group,
        belt: bracket.belt as Belt,
        competitors: [],
        matches,
      });
    }

    setBrackets(loadedBrackets);
  };

  const handleAddCompetitor = (competitor: Competitor) => {
    setCompetitors((prev) => [...prev, competitor]);
  };

  const handleGenerateBrackets = async () => {
    if (competitors.length < 2) {
      toast.error("Se necesitan al menos 2 competidores para generar brackets");
      return;
    }

    const newBrackets = generateBrackets(competitors);
    
    if (newBrackets.length === 0) {
      toast.error("No se pudieron generar brackets. Verifica que haya competidores compatibles.");
      return;
    }

    // Save brackets and matches to database
    for (const bracket of newBrackets) {
      const { error: bracketError } = await supabase
        .from('brackets')
        .insert({
          id: bracket.id,
          age_group: bracket.ageGroup,
          weight_group: bracket.weightGroup,
          belt: bracket.belt,
        });

      if (bracketError) {
        console.error('Error saving bracket:', bracketError);
        toast.error("Error al guardar brackets");
        return;
      }

      // Save matches for this bracket
      const matchesToInsert = bracket.matches.map((match) => ({
        id: match.id,
        bracket_id: bracket.id,
        match_number: match.position,
        round: match.round,
        competitor1_id: match.competitor1?.id || null,
        competitor2_id: match.competitor2?.id || null,
        winner_id: match.winner?.id || null,
      }));

      const { error: matchesError } = await supabase
        .from('matches')
        .insert(matchesToInsert);

      if (matchesError) {
        console.error('Error saving matches:', matchesError);
        toast.error("Error al guardar matches");
        return;
      }
    }

    setBrackets(newBrackets);
    toast.success(`${newBrackets.length} bracket(s) generado(s) exitosamente`);
  };

  const handleSelectWinner = async (bracketId: string, matchId: string, winnerId: string) => {
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

        // Update winner in database
        supabase
          .from('matches')
          .update({ winner_id: winner.id })
          .eq('id', matchId)
          .then(({ error }) => {
            if (error) {
              console.error('Error updating match winner:', error);
              toast.error("Error al actualizar ganador");
            }
          });

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

          // Update next match in database
          supabase
            .from('matches')
            .update({
              competitor1_id: isFirstSlot ? winner.id : nextMatch.competitor1?.id || null,
              competitor2_id: !isFirstSlot ? winner.id : nextMatch.competitor2?.id || null,
            })
            .eq('id', nextMatch.id)
            .then(({ error }) => {
              if (error) {
                console.error('Error updating next match:', error);
              }
            });
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
