export type Belt = "Blanca" | "Azul" | "Morada" | "Café" | "Negra";

export interface Competitor {
  id: string;
  name: string;
  age: number;
  weight: number;
  belt: Belt;
}

export interface Match {
  id: string;
  competitor1?: Competitor;
  competitor2?: Competitor;
  winner?: Competitor;
  round: number;
  position: number;
}

export interface Bracket {
  id: string;
  belt: Belt;
  ageGroup: string;
  weightGroup: string;
  competitors: Competitor[];
  matches: Match[];
}
