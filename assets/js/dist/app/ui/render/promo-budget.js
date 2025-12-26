// @ts-nocheck
import { state } from "../../game.js";
import { getPromoTypeCosts, PROMO_TYPE_DETAILS } from "../../promo_types.js";
const PROMO_BUDGET_MIN = 100;
function getPromoInflationMultiplier() {
    const currentYear = new Date(state.time?.epochMs || Date.now()).getUTCFullYear();
    const baseYear = state.meta?.startYear || new Date(state.time?.startEpochMs || state.time?.epochMs || Date.now()).getUTCFullYear();
    const yearsElapsed = Math.max(0, currentYear - baseYear);
    const annualInflation = 0.02;
    return Math.pow(1 + annualInflation, yearsElapsed);
}
function getModifierCosts(modifier, inflationMultiplier = 1) {
    const baseCost = Number.isFinite(modifier?.basePrice) ? modifier.basePrice : 0;
    const adjustedCost = Math.round(baseCost * Math.max(1, inflationMultiplier));
    return { baseCost, adjustedCost };
}
function getRolloutBudgetForType(typeId, inflationMultiplier) {
    const { adjustedCost } = getPromoTypeCosts(typeId, inflationMultiplier);
    const raw = state.ui?.promoBudgets?.[typeId];
    const parsed = Number(raw);
    const fallback = Math.max(PROMO_BUDGET_MIN, adjustedCost);
    if (!Number.isFinite(parsed))
        return fallback;
    return Math.max(PROMO_BUDGET_MIN, Math.round(parsed));
}
function buildRolloutBudgetSummary(strategy) {
    if (!strategy || !Array.isArray(strategy.weeks))
        return null;
    const inflationMultiplier = getPromoInflationMultiplier();
    const counts = {};
    strategy.weeks.forEach((week) => {
        (week?.events || []).forEach((eventItem) => {
            const typeId = eventItem?.actionType || "";
            if (!typeId)
                return;
            counts[typeId] = (counts[typeId] || 0) + 1;
        });
    });
    const entries = Object.entries(counts);
    if (!entries.length) {
        return {
            eventCount: 0,
            totalBase: 0,
            totalAdjusted: 0,
            totalPlanned: 0,
            byType: []
        };
    }
    const summary = {
        eventCount: 0,
        totalBase: 0,
        totalAdjusted: 0,
        totalPlanned: 0,
        byType: []
    };
    entries.forEach(([typeId, count]) => {
        const { baseCost, adjustedCost } = getPromoTypeCosts(typeId, inflationMultiplier);
        const plannedCost = getRolloutBudgetForType(typeId, inflationMultiplier);
        const label = PROMO_TYPE_DETAILS[typeId]?.label || typeId;
        const entry = {
            typeId,
            label,
            count,
            baseCost,
            adjustedCost,
            plannedCost,
            totalBase: baseCost * count,
            totalAdjusted: adjustedCost * count,
            totalPlanned: plannedCost * count
        };
        summary.eventCount += count;
        summary.totalBase += entry.totalBase;
        summary.totalAdjusted += entry.totalAdjusted;
        summary.totalPlanned += entry.totalPlanned;
        summary.byType.push(entry);
    });
    return summary;
}
export { buildRolloutBudgetSummary, getModifierCosts, getPromoInflationMultiplier };
//# sourceMappingURL=promo-budget.js.map