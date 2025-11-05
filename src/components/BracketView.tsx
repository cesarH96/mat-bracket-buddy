import { Bracket } from "@/types/tournament";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface BracketViewProps {
  brackets: Bracket[];
  onSelectWinner: (bracketId: string, matchId: string, winnerId: string) => void;
}

const beltColors: Record<string, string> = {
  Blanca: "bg-gray-100 text-gray-900 border-gray-300",
  Azul: "bg-blue-500 text-white",
  Morada: "bg-purple-600 text-white",
  Café: "bg-amber-800 text-white",
  Negra: "bg-gray-900 text-white",
};

export const BracketView = ({ brackets, onSelectWinner }: BracketViewProps) => {
  if (brackets.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Brackets de Competencia</CardTitle>
          <CardDescription>No hay brackets generados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Registra competidores y genera brackets para comenzar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Brackets de Competencia</h2>
      {brackets.map((bracket) => {
        const rounds = Math.max(...bracket.matches.map((m) => m.round));
        
        return (
          <Card key={bracket.id} className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {bracket.ageGroup} - {bracket.weightGroup}
                  </CardTitle>
                  <CardDescription>{bracket.competitors.length} competidores</CardDescription>
                </div>
                <Badge className={beltColors[bracket.belt]} variant="outline">
                  {bracket.belt}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="flex gap-8 pb-4 min-w-max">
                  {Array.from({ length: rounds }, (_, roundIndex) => {
                    const round = roundIndex + 1;
                    const roundMatches = bracket.matches.filter((m) => m.round === round);
                    
                    return (
                      <div key={round} className="flex flex-col gap-4 min-w-[280px]">
                        <h3 className="text-lg font-semibold text-center text-primary">
                          {round === rounds ? "Final" : `Ronda ${round}`}
                        </h3>
                        <div className="space-y-4">
                          {roundMatches.map((match) => (
                            <div
                              key={match.id}
                              className="border rounded-lg p-3 bg-card space-y-2"
                            >
                              <div
                                className={`p-2 rounded border ${
                                  match.winner?.id === match.competitor1?.id
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-accent/5"
                                }`}
                              >
                                {match.competitor1 ? (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                      {match.competitor1.name}
                                    </span>
                                    {!match.winner && match.competitor2 && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          onSelectWinner(
                                            bracket.id,
                                            match.id,
                                            match.competitor1!.id
                                          )
                                        }
                                      >
                                        ✓
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">TBD</span>
                                )}
                              </div>
                              
                              <div className="text-center text-xs text-muted-foreground">vs</div>
                              
                              <div
                                className={`p-2 rounded border ${
                                  match.winner?.id === match.competitor2?.id
                                    ? "bg-primary/10 border-primary"
                                    : "hover:bg-accent/5"
                                }`}
                              >
                                {match.competitor2 ? (
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                      {match.competitor2.name}
                                    </span>
                                    {!match.winner && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() =>
                                          onSelectWinner(
                                            bracket.id,
                                            match.id,
                                            match.competitor2!.id
                                          )
                                        }
                                      >
                                        ✓
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    {match.competitor1 ? "Bye" : "TBD"}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
