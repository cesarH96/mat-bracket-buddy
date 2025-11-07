import { Competitor } from "@/types/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DraggableCompetitor } from "./DraggableCompetitor";

interface CompetitorListProps {
  competitors: Competitor[];
  onSelectCompetitor?: (competitor: Competitor) => void;
}

const beltColors: Record<string, string> = {
  Blanca: "bg-gray-100 text-gray-900 border-gray-300",
  Azul: "bg-blue-500 text-white",
  Morada: "bg-purple-600 text-white",
  Café: "bg-amber-800 text-white",
  Negra: "bg-gray-900 text-white",
};

export const CompetitorList = ({ competitors, onSelectCompetitor }: CompetitorListProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Competidores Disponibles</CardTitle>
        <p className="text-sm text-muted-foreground">
          {competitors.length} disponible(s)
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {competitors.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No hay competidores registrados aún
            </p>
          ) : (
            <div className="space-y-3">
              {competitors.map((competitor) => (
                <div 
                  key={competitor.id}
                  onClick={() => onSelectCompetitor?.(competitor)}
                >
                  <DraggableCompetitor 
                    competitor={competitor} 
                    beltColors={beltColors}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
