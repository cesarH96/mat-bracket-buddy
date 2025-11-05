import { Competitor, Bracket, Match, Belt } from "@/types/tournament";

const AGE_GROUPS = [
  { name: "Infantil", min: 5, max: 12 },
  { name: "Juvenil", min: 13, max: 17 },
  { name: "Adulto", min: 18, max: 35 },
  { name: "Master", min: 36, max: 100 },
];

const WEIGHT_GROUPS = [
  { name: "Pluma", min: 0, max: 64 },
  { name: "Ligero", min: 64.1, max: 70 },
  { name: "Medio", min: 70.1, max: 76 },
  { name: "Medio-Pesado", min: 76.1, max: 82 },
  { name: "Pesado", min: 82.1, max: 94 },
  { name: "Super-Pesado", min: 94.1, max: 200 },
];

function getAgeGroup(age: number): string {
  const group = AGE_GROUPS.find((g) => age >= g.min && age <= g.max);
  return group?.name || "Sin clasificar";
}

function getWeightGroup(weight: number): string {
  const group = WEIGHT_GROUPS.find((g) => weight >= g.min && weight <= g.max);
  return group?.name || "Sin clasificar";
}

function generateMatches(competitors: Competitor[]): Match[] {
  const matches: Match[] = [];
  const numCompetitors = competitors.length;
  
  if (numCompetitors < 2) return [];

  // Calculate number of rounds needed
  const totalRounds = Math.ceil(Math.log2(numCompetitors));
  
  // First round matches
  let currentRound = 1;
  let position = 0;
  
  for (let i = 0; i < numCompetitors; i += 2) {
    const match: Match = {
      id: crypto.randomUUID(),
      competitor1: competitors[i],
      competitor2: competitors[i + 1] || undefined,
      round: currentRound,
      position: position++,
    };
    matches.push(match);
  }

  // Create placeholder matches for subsequent rounds
  let previousRoundMatches = Math.ceil(numCompetitors / 2);
  for (let round = 2; round <= totalRounds; round++) {
    const matchesInRound = Math.ceil(previousRoundMatches / 2);
    position = 0;
    
    for (let i = 0; i < matchesInRound; i++) {
      matches.push({
        id: crypto.randomUUID(),
        round,
        position: position++,
      });
    }
    
    previousRoundMatches = matchesInRound;
  }

  return matches;
}

export function generateBrackets(competitors: Competitor[]): Bracket[] {
  const brackets: Bracket[] = [];
  const groupedCompetitors = new Map<string, Competitor[]>();

  // Group competitors by belt, age group, and weight group
  competitors.forEach((competitor) => {
    const ageGroup = getAgeGroup(competitor.age);
    const weightGroup = getWeightGroup(competitor.weight);
    const key = `${competitor.belt}-${ageGroup}-${weightGroup}`;

    if (!groupedCompetitors.has(key)) {
      groupedCompetitors.set(key, []);
    }
    groupedCompetitors.get(key)!.push(competitor);
  });

  // Create brackets for each group
  groupedCompetitors.forEach((groupCompetitors, key) => {
    if (groupCompetitors.length >= 2) {
      const [belt, ageGroup, weightGroup] = key.split("-");
      const matches = generateMatches(groupCompetitors);

      brackets.push({
        id: crypto.randomUUID(),
        belt: belt as Belt,
        ageGroup,
        weightGroup,
        competitors: groupCompetitors,
        matches,
      });
    }
  });

  return brackets;
}
