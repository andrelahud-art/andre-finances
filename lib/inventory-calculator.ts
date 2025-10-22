export interface InventoryValuation {
  totalValue: number;
  unitCost: number;
  quantity: number;
}

export function calculateAverageCost(
  totalValue: number,
  totalUnits: number
): number {
  if (totalUnits === 0) return 0;
  return Math.round((totalValue / totalUnits) * 100) / 100;
}

export function calculateFIFOValue(
  entries: Array<{ quantity: number; cost: number }>,
  unitsToValue: number
): number {
  let remaining = unitsToValue;
  let totalValue = 0;

  for (const entry of entries) {
    if (remaining <= 0) break;
    const unitsFromEntry = Math.min(entry.quantity, remaining);
    totalValue += unitsFromEntry * entry.cost;
    remaining -= unitsFromEntry;
  }

  return Math.round(totalValue * 100) / 100;
}
