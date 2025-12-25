const formatMoney = (amount: number) => {
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

const getPromoTypeDetails = (typeId?: string) => {
  if (typeId && PROMO_TYPE_DETAILS[typeId]) return PROMO_TYPE_DETAILS[typeId];
  return PROMO_TYPE_DETAILS[DEFAULT_PROMO_TYPE];
};

const buildPromoHint = (typeId?: string) => {
  const details = getPromoTypeDetails(typeId);
  return `Requirement: ${details.requirement} | Typical cost: ${formatMoney(details.cost)}`;
};

export {
  PROMO_TYPE_DETAILS,
  DEFAULT_PROMO_TYPE,
  getPromoTypeDetails,
  buildPromoHint
};
