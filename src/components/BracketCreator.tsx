import { useDroppable } from "@dnd-kit/core";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Competitor } from "@/types/tournament";
import { Badge } from "./ui/badge";
import { X } from "lucide-react";

interface BracketCreatorProps {
  selectedCompetitors: Competitor[];
  groupName: string;
  onGroupNameChange: (name: string) => void;
  onRemoveCompetitor: (id: string) => void;
  onCreateBracket: () => void;
  beltColors: Record<string, string>;
}

export const BracketCreator = ({
  selectedCompetitors,
  groupName,
  onGroupNameChange,
  onRemoveCompetitor,
  onCreateBracket,
  beltColors,
}: BracketCreatorProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: "bracket-creator",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Bracket</CardTitle>
        <p className="text-sm text-muted-foreground">
          Selecciona competidores y asigna un nombre al grupo
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupName">Nombre del Grupo</Label>
          <Input
            id="groupName"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            placeholder="Ej: Adulto - Medio - Azul"
          />
        </div>

        <div className="space-y-2">
          <Label>Competidores Seleccionados ({selectedCompetitors.length})</Label>
          <div
            ref={setNodeRef}
            className={`min-h-[200px] p-4 border-2 border-dashed rounded-lg transition-colors ${
              isOver ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            {selectedCompetitors.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Haz clic en los competidores disponibles para agregarlos
              </div>
            ) : (
              <div className="space-y-2">
                {selectedCompetitors.map((competitor) => (
                  <div
                    key={competitor.id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">{competitor.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {competitor.age} años • {competitor.weight} kg
                        {competitor.academia && ` • ${competitor.academia}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={beltColors[competitor.belt]}>{competitor.belt}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveCompetitor(competitor.id)}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={onCreateBracket}
          disabled={selectedCompetitors.length === 0}
          className="w-full"
        >
          Crear Bracket
        </Button>
      </CardContent>
    </Card>
  );
};
