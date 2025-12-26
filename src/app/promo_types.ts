const formatMoney = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US")}`;
};

const EYERISOCIAL_POST_COST = 600;
const EYERISOCIAL_AD_COST_MULTIPLIER = 3;
const EYERISOCIAL_AD_COST = EYERISOCIAL_POST_COST * EYERISOCIAL_AD_COST_MULTIPLIER;

const PROMO_TYPE_DETAILS = {
  musicVideo: {
    label: "Music Video",
    requirement: "Final video + clearance",
    facility: "filming",
    supportsActOnly: false,
    requiresTrack: true,
    cost: 7500
  },
  livePerformance: {
    label: "Live Performance",
    requirement: "Venue slot + live-ready set",
    facility: "broadcast",
    supportsActOnly: true,
    requiresTrack: false,
    broadcastProgramId: "eyeris-live-set",
    cost: 3000
  },
  eyeriSocialPost: {
    label: "eyeriSocial Post",
    requirement: "Cover art + caption",
    facility: null,
    supportsActOnly: true,
    requiresTrack: false,
    cost: EYERISOCIAL_POST_COST
  },
  eyeriSocialAd: {
    label: "eyeriSocial Ad",
    requirement: "Multimedia post + placement",
    facility: "filming",
    supportsActOnly: false,
    requiresTrack: true,
    cost: EYERISOCIAL_AD_COST
  },
  interview: {
    label: "Interview",
    requirement: "Press kit + talking points",
    facility: "broadcast",
    supportsActOnly: true,
    requiresTrack: false,
    broadcastProgramId: "eyeris-interview",
    cost: 1200
  },
  primeShowcase: {
    label: "Prime Time Showcase",
    requirement: "Charting track + quality 70+ + act press kit",
    facility: "broadcast",
    supportsActOnly: true,
    requiresTrack: false,
    broadcastProgramId: "eyeris-prime-showcase",
    cost: 15000
  }
};

const DEFAULT_PROMO_TYPE = "musicVideo";

const getPromoTypeDetails = (typeId?: string) => {
  if (typeId && PROMO_TYPE_DETAILS[typeId]) return PROMO_TYPE_DETAILS[typeId];
  return PROMO_TYPE_DETAILS[DEFAULT_PROMO_TYPE];
};

const getPromoTypeCosts = (typeId?: string, inflationMultiplier = 1) => {
  const details = getPromoTypeDetails(typeId);
  const baseCost = details.cost;
  const adjustedCost = Math.round(baseCost * Math.max(1, inflationMultiplier));
  return { baseCost, adjustedCost };
};

const buildPromoHint = (typeId?: string, inflationMultiplier = 1) => {
  const details = getPromoTypeDetails(typeId);
  const { baseCost, adjustedCost } = getPromoTypeCosts(typeId, inflationMultiplier);
  const inflatedLabel = inflationMultiplier !== 1 ? ` | Inflation-adjusted: ${formatMoney(adjustedCost)}` : "";
  return `Requirement: ${details.requirement} | Base: ${formatMoney(baseCost)}${inflatedLabel}`;
};

export {
  PROMO_TYPE_DETAILS,
  DEFAULT_PROMO_TYPE,
  getPromoTypeDetails,
  getPromoTypeCosts,
  buildPromoHint
};
