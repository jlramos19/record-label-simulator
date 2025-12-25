const formatMoney = (amount) => {
    const sign = amount < 0 ? "-" : "";
    const abs = Math.abs(amount);
    return `${sign}$${abs.toLocaleString("en-US")}`;
};
const PROMO_TYPE_DETAILS = {
    musicVideo: {
        label: "Music Video",
        requirement: "Final video + clearance",
        cost: 7500
    },
    livePerformance: {
        label: "Live Performance",
        requirement: "Venue slot + live-ready set",
        cost: 3000
    },
    eyeriSocialPost: {
        label: "eyeriSocial Post",
        requirement: "Cover art + caption",
        cost: 600
    },
    interview: {
        label: "Interview",
        requirement: "Press kit + talking points",
        cost: 1200
    }
};
const DEFAULT_PROMO_TYPE = "musicVideo";
const getPromoTypeDetails = (typeId) => {
    if (typeId && PROMO_TYPE_DETAILS[typeId])
        return PROMO_TYPE_DETAILS[typeId];
    return PROMO_TYPE_DETAILS[DEFAULT_PROMO_TYPE];
};
const getPromoTypeCosts = (typeId, inflationMultiplier = 1) => {
    const details = getPromoTypeDetails(typeId);
    const baseCost = details.cost;
    const adjustedCost = Math.round(baseCost * Math.max(1, inflationMultiplier));
    return { baseCost, adjustedCost };
};
const buildPromoHint = (typeId, inflationMultiplier = 1) => {
    const details = getPromoTypeDetails(typeId);
    const { baseCost, adjustedCost } = getPromoTypeCosts(typeId, inflationMultiplier);
    const inflatedLabel = inflationMultiplier !== 1 ? ` | Inflation-adjusted: ${formatMoney(adjustedCost)}` : "";
    return `Requirement: ${details.requirement} | Base: ${formatMoney(baseCost)}${inflatedLabel}`;
};
export { PROMO_TYPE_DETAILS, DEFAULT_PROMO_TYPE, getPromoTypeDetails, getPromoTypeCosts, buildPromoHint };
