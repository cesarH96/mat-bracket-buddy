import { Competitor } from "@/types/tournament";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CompetitorListProps {
  competitors: Competitor[];
}

const beltColors: Record<string, string> = {
  Blanca: "bg-gray-100 text-gray-900 border-gray-300",
  Azul: "bg-blue-500 text-white",
  Morada: "bg-purple-600 text-white",
  Café: "bg-amber-800 text-white",
  Negra: "bg-gray-900 text-white",
};

export const CompetitorList = ({ competitors }: CompetitorListProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Competidores Registrados</CardTitle>
        <CardDescription>Total: {competitors.length}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {competitors.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay competidores registrados
              </p>
            ) : (
              competitors.map((competitor) => (
                <div
                  key={competitor.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{competitor.name}</h3>
                    <div className="flex gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{competitor.age} años</span>
                      <span>•</span>
                      <span>{competitor.weight} kg</span>
                    </div>
                  </div>
                  <Badge className={beltColors[competitor.belt]} variant="outline">
                    {competitor.belt}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
