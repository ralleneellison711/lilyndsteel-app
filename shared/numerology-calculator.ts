/**
 * Lily & Steel — Life Path calculator + Blueprint generator
 */

export function sumDigits(n: number): number {
  return String(Math.abs(n))
    .split("")
    .reduce((acc, ch) => acc + (ch >= "0" && ch <= "9" ? Number(ch) : 0), 0);
}

export function reduceWithMasters(n: number, masters = new Set([11, 22, 33])): number {
  let x = n;

  while (x > 9 && !masters.has(x)) {
    x = sumDigits(x);
  }
  return x;
}

export function calculateLifePath(input: Date | string, masters = new Set([11, 22, 33])): number {
  let year: number, month: number, day: number;

  if (input instanceof Date) {
    year = input.getFullYear();
    month = input.getMonth() + 1;
    day = input.getDate();
  } else if (typeof input === "string") {
    const s = input.trim();

    // Try ISO YYYY-MM-DD
    const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (iso) {
      year = Number(iso[1]);
      month = Number(iso[2]);
      day = Number(iso[3]);
    } else {
      // Try US MM/DD/YYYY
      const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!us) throw new Error("Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY.");
      month = Number(us[1]);
      day = Number(us[2]);
      year = Number(us[3]);
    }
  } else {
    throw new Error("Invalid birthdate input type.");
  }

  // Basic sanity checks
  if (
    !Number.isInteger(year) || year < 1000 || year > 9999 ||
    !Number.isInteger(month) || month < 1 || month > 12 ||
    !Number.isInteger(day) || day < 1 || day > 31
  ) {
    throw new Error("Birthdate values out of range.");
  }

  // Sum digits of YYYYMMDD
  const digits = `${year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`
    .split("")
    .map(Number);

  const total = digits.reduce((a, b) => a + b, 0);
  return reduceWithMasters(total, masters);
}

// Types for the blueprint generator
export interface LifePathData {
  number: number;
  title: string;
  subtitle: string;
  meaning: string;
  meAffirmation: string;
  coreCrystalIds: string[];
}

export interface MotionStateData {
  id: string;
  displayName: string;
  subtitle: string;
  description: string;
  affirmation: string;
  recommendedBraceletStyleId: string;
  recommendedCrystalIds: string[];
}

export interface BraceletStyleData {
  id: string;
  displayName: string;
  symbol: string;
  motion: string;
  shortDesc: string;
  price: number;
  imageUrl?: string | null;
}

export interface CrystalData {
  id: string;
  displayName: string;
  shortDesc: string;
  price: number;
  imageUrl?: string | null;
}

export interface BlueprintInput {
  lifePath: LifePathData;
  motion: MotionStateData | null;
  crystals: CrystalData[];
  braceletStyles: BraceletStyleData[];
  selectedCoreCrystalId?: string | null;
  selectedSupportCrystalId?: string | null;
  inventory?: string[];
}

export interface Blueprint {
  lifePath: {
    number: number;
    title: string;
    subtitle: string;
    meaning: string;
    affirmation: string;
  };
  motion: {
    id: string;
    displayName: string;
    subtitle: string;
    description: string;
    affirmation: string;
  } | null;
  braceletStyle: {
    id: string;
    displayName: string;
    symbol: string;
    motion: string;
    shortDesc: string;
    price: number;
    imageUrl?: string | null;
  } | null;
  crystals: {
    core: CrystalData | null;
    support: CrystalData | null;
    selectedIds: string[];
  };
  meaningParagraph: string;
  meAffirmations: string[];
}

function chooseCoreCrystalId(lifePath: LifePathData, crystals: CrystalData[], inventorySet?: Set<string>): string | null {
  const ids = lifePath.coreCrystalIds ?? [];
  if (!ids.length) return null;

  if (inventorySet && inventorySet.size > 0) {
    const available = ids.find((id) => inventorySet.has(id));
    if (available) return available;
  }
  return ids[0];
}

function chooseSupportCrystalId(
  lifePath: LifePathData,
  motion: MotionStateData,
  inventorySet?: Set<string>
): string | null {
  const lpIds = new Set(lifePath.coreCrystalIds ?? []);
  const motionIds = motion.recommendedCrystalIds ?? [];

  // Overlap first (crystals that are both in life path and motion)
  const overlap = motionIds.filter((id) => lpIds.has(id));
  const candidates = overlap.length ? overlap : motionIds;

  if (inventorySet && inventorySet.size > 0) {
    const inStock = candidates.find((id) => inventorySet.has(id));
    if (inStock) return inStock;
  }
  return candidates[0] ?? null;
}

export function generateBlueprint(input: BlueprintInput): Blueprint {
  const { lifePath, motion, crystals, braceletStyles, selectedCoreCrystalId, selectedSupportCrystalId, inventory = [] } = input;
  
  const inventorySet = new Set(inventory);
  const crystalMap = new Map(crystals.map(c => [c.id, c]));

  // Core crystal
  const coreCrystalId = selectedCoreCrystalId ?? chooseCoreCrystalId(lifePath, crystals, inventorySet);
  const coreCrystal = coreCrystalId ? crystalMap.get(coreCrystalId) ?? null : null;

  // Bracelet style (based on motion or default)
  let braceletStyle: BraceletStyleData | null = null;
  if (motion) {
    braceletStyle = braceletStyles.find(b => b.id === motion.recommendedBraceletStyleId) ?? null;
  }
  if (!braceletStyle && braceletStyles.length > 0) {
    braceletStyle = braceletStyles.find(b => b.id === 'witness') ?? braceletStyles[0];
  }

  // Support crystal (only if motion is selected)
  let supportCrystalId: string | null = null;
  if (motion) {
    supportCrystalId = selectedSupportCrystalId ?? chooseSupportCrystalId(lifePath, motion, inventorySet);
  }

  // Don't duplicate the same stone twice
  if (coreCrystalId && supportCrystalId && coreCrystalId === supportCrystalId) {
    const motionList = motion?.recommendedCrystalIds || [];
    supportCrystalId = motionList.find((id) => id !== coreCrystalId && (!inventorySet.size || inventorySet.has(id))) || null;
  }

  const supportCrystal = supportCrystalId ? crystalMap.get(supportCrystalId) ?? null : null;

  // Selected crystals (max 2)
  const selectedIds = [coreCrystalId, supportCrystalId].filter(Boolean) as string[];
  const limitedCrystals = selectedIds.slice(0, 2);

  // Meaning paragraph
  const parts: string[] = [];
  parts.push(`Your Life Path reflects how ME learns itself: ${lifePath.title}.`);
  if (motion) {
    parts.push(`Your current Motion reflects how ME is moving right now: ${motion.displayName}.`);
  }
  if (limitedCrystals.length) {
    parts.push(`Your crystal${limitedCrystals.length > 1 ? "s" : ""} support this with grounded intention—support, not prediction.`);
  }
  const meaningParagraph = parts.join(" ");

  // Affirmations
  const affirmations: string[] = [];
  affirmations.push(lifePath.meAffirmation);
  if (motion) {
    affirmations.push(motion.affirmation);
  }

  return {
    lifePath: {
      number: lifePath.number,
      title: lifePath.title,
      subtitle: lifePath.subtitle,
      meaning: lifePath.meaning,
      affirmation: lifePath.meAffirmation,
    },
    motion: motion ? {
      id: motion.id,
      displayName: motion.displayName,
      subtitle: motion.subtitle,
      description: motion.description,
      affirmation: motion.affirmation,
    } : null,
    braceletStyle: braceletStyle ? {
      id: braceletStyle.id,
      displayName: braceletStyle.displayName,
      symbol: braceletStyle.symbol,
      motion: braceletStyle.motion,
      shortDesc: braceletStyle.shortDesc,
      price: braceletStyle.price,
      imageUrl: braceletStyle.imageUrl,
    } : null,
    crystals: {
      core: coreCrystal,
      support: supportCrystal,
      selectedIds: limitedCrystals,
    },
    meaningParagraph,
    meAffirmations: affirmations,
  };
}
