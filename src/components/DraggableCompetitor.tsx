import { useDraggable } from "@dnd-kit/core";
import { Badge } from "./ui/badge";
import { Competitor } from "@/types/tournament";

interface DraggableCompetitorProps {
  competitor: Competitor;
  beltColors: Record<string, string>;
}

export const DraggableCompetitor = ({ competitor, beltColors }: DraggableCompetitorProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: competitor.id,
    data: competitor,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-all cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{competitor.name}</h3>
          <p className="text-sm text-muted-foreground">
            {competitor.age} años • {competitor.weight} kg
            {competitor.academia && ` • ${competitor.academia}`}
          </p>
        </div>
        <Badge className={beltColors[competitor.belt]}>{competitor.belt}</Badge>
      </div>
    </div>
  );
};
