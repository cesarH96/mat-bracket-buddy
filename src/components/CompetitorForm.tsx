import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Belt, Competitor } from "@/types/tournament";
import { toast } from "sonner";

interface CompetitorFormProps {
  onAddCompetitor: (competitor: Competitor) => void;
}

const BELTS: Belt[] = ["Blanca", "Azul", "Morada", "Café", "Negra"];

export const CompetitorForm = ({ onAddCompetitor }: CompetitorFormProps) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [belt, setBelt] = useState<Belt | "">("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !age || !weight || !belt) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    const competitor: Competitor = {
      id: crypto.randomUUID(),
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      belt: belt as Belt,
    };

    onAddCompetitor(competitor);
    toast.success(`${name} registrado exitosamente`);
    
    // Reset form
    setName("");
    setAge("");
    setWeight("");
    setBelt("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Registro de Competidor</CardTitle>
        <CardDescription>Ingresa los datos del competidor</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="18"
                min="5"
                max="100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70.0"
                min="30"
                max="200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="belt">Cinta</Label>
            <Select value={belt} onValueChange={(value) => setBelt(value as Belt)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona la cinta" />
              </SelectTrigger>
              <SelectContent>
                {BELTS.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">
            Registrar Competidor
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
