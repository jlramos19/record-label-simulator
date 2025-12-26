// eyeriSocial templates for system updates and promo posts.
const formatMoney = (amount) => {
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  return `${sign}$${abs.toLocaleString("en-US")}`;
};
const formatCount = (value) => Math.round(value || 0).toLocaleString("en-US");
const promoDefaults = (vars = {}) => ({
  actName: vars.actName || "Unknown Act",
  trackTitle: vars.trackTitle || "Untitled",
  releaseDate: vars.releaseDate || "TBD"
});
const promoCost = (value, fallback) => formatMoney(Number.isFinite(value) ? value : fallback);
const SOCIAL_TEMPLATES = {
  releaseAnnouncement: {
    id: "releaseAnnouncement",
    title: "Release Announcement",
    type: "track",
    render: (vars) => ({
      title: `Release: ${vars.trackTitle || "Untitled"}`,
      lines: [
        `${vars.actName || "Unknown Act"} released "${vars.trackTitle || "Untitled"}".`,
        `Channel: ${vars.channel || "Digital"} | Release: ${vars.releaseDate || "Today"}`,
        `Promo: ${vars.promo || "None"}`
      ],
      type: "track"
    })
  },
  releaseSchedule: {
    id: "releaseSchedule",
    title: "Release Schedule",
    type: "track",
    render: (vars) => ({
      title: `Scheduled: ${vars.trackTitle || "Untitled"}`,
      lines: [
        `${vars.actName || "Unknown Act"} is scheduled to release "${vars.trackTitle || "Untitled"}".`,
        `Planned Release: ${vars.releaseDate || "TBD"} | Channel: ${vars.channel || "Digital"}`
      ],
      type: "track"
    })
  },
  futurePlans: {
    id: "futurePlans",
    title: "Future Plans",
    type: "system",
    render: (vars) => ({
      title: `Looking Ahead: ${vars.actName || "Your Act"}`,
      lines: [
        `${vars.actName || "Our roster"} is planning the next steps.`,
        vars.trackTitle ? `Next up: "${vars.trackTitle}"` : "Next up: new content in development.",
        vars.releaseDate ? `Target window: ${vars.releaseDate}` : "Target window: TBD"
      ],
      type: "system"
    })
  },
  questInvitation: {
    id: "questInvitation",
    title: "Quest Invitation",
    type: "quest",
    render: (vars) => ({
      title: `Email: Quest - ${vars.subject || "Untitled"}`,
      lines: [
        `From: ${vars.fromName || "Hann Record Label"}`,
        `Email: ${vars.fromEmail || "no-reply@HannRecordLabel.com"}`,
        `Phone: ${vars.fromPhone || "(001) 420-6969"}`,
        "Address:",
        vars.fromAddress1 || "1001 West 2nd Street, Floor 1",
        vars.fromAddress2 || "Hann Campus",
        vars.fromAddress3 || "Bloomville, Audora",
        vars.fromAddress4 || "Annglora 1001",
        `To: ${vars.toName || "Player Name"}`,
        `Phone: ${vars.toPhone || "(001) 555-1919"}`,
        `Email: ${vars.toEmail || "playername@email.ann"}`,
        "Address:",
        vars.toAddress1 || "1919 East 19th Street",
        vars.toAddress2 || "Gleaming Meadows",
        vars.toAddress3 || "Bloomville, Audora",
        vars.toAddress4 || "Annglora 1007",
        "",
        vars.body || "We are looking for a Creator who can support a targeted objective.",
        "",
        `Objective: ${vars.objective || "TBD"}`,
        `Reward: ${vars.reward ? formatMoney(vars.reward) : "TBD"}`
      ],
      type: "quest"
    })
  },
  contractWelcome: {
    id: "contractWelcome",
    title: "Contract Welcome",
    type: "contract",
    render: (vars) => ({
      title: `Email: Welcome - ${vars.creatorName || "Creator"} at ${vars.labelName || "Record Label"}`,
      lines: [
        `From: ${vars.labelName || "Hann Record Label"}`,
        `Email: ${vars.labelEmail || "no-reply@HannmusicLabel.com"}`,
        `Phone: ${vars.labelPhone || "(001) 420-6969"}`,
        "Address:",
        vars.labelAddress1 || "1001 West 2nd Street, Floor 1",
        vars.labelAddress2 || "Hann Campus",
        vars.labelAddress3 || "Bloomville, Audora",
        vars.labelAddress4 || "Annglora 1001",
        `To: ${vars.creatorName || "Creator Name"}`,
        `Email: ${vars.creatorEmail || "creatorname@email.ann"}`,
        "Address:",
        vars.creatorAddress1 || "1919 East 19th Street",
        vars.creatorAddress2 || "Gleaming Meadows",
        vars.creatorAddress3 || "Bloomville, Audora",
        vars.creatorAddress4 || "Annglora 1007",
        "",
        `Hello, ${vars.creatorName || "Creator Name"}!`,
        `Welcome to ${vars.labelName || "Hann Record Label"} as our new ${vars.role || "Creator"}, starting ${vars.startDate || "Today"}.`,
        "Next Objective:",
        vars.nextObjective || "Generic task",
        "",
        "Reward:",
        `${vars.salary || "[Salary/Hourly Wage]"} per ${vars.period || "[Time Period]"}, until ${vars.endDate || "[EndDate]"}.`,
        `${vars.exp ? `${formatCount(vars.exp)} EXP.` : "[EXPAmount] EXP."}`
      ],
      type: "contract"
    })
  },
  receiptEmail: {
    id: "receiptEmail",
    title: "Receipt Email",
    type: "receipt",
    render: (vars) => ({
      title: `Receipt: ${vars.project || "\"Your Eyes\" - Single Album (Digital)"}`,
      lines: [
        `Dear ${vars.buyer || "Community Member"},`,
        `Thank you for purchasing ${vars.project || "[Project]"} by ${vars.act || "[Act]"}.`,
        "",
        "Order Information:",
        `Project Name: ${vars.projectName || "Your Eyes - Single Album"}`,
        `Track(s): ${vars.trackCount || 1}`,
        "Tracklist:",
        `1. ${vars.trackName || "Your Eyes"}`,
        `Act: ${vars.act || "Monique Goldberg"}`,
        `Theme: ${vars.theme || "Freedom"}`,
        `Mood: ${vars.mood || "Calm"}`,
        `Content Genre: ${vars.genre || "Calming Freedom"}`,
        `Price: ${vars.price ? formatMoney(vars.price) : "AND$1.00"}`,
        `Released: ${vars.released || "FRI - JAN 03, 2200 - 12AM"}`,
        `Record Label: ${vars.label || "Hedren Record Label"}`,
        "",
        "Purchase Details:",
        `Purchase Date: ${vars.purchaseDate || "[DAY - MMM DD, YYYY - HHtt]"}`,
        `Total Paid: ${vars.totalPaid ? formatMoney(vars.totalPaid) : "AND$1.00"}`,
        `Payment Method: ${vars.payment || "Credit Card"}`,
        "",
        "Best,",
        `${vars.senderName || "[Your Name]"}`,
        `${vars.senderRole || "[Your Position]"}`,
        `${vars.label || "Hedren Record Label"}`
      ],
      type: "receipt"
    })
  },
  cccSigned: {
    id: "cccSigned",
    title: "CCC: Signed",
    type: "ccc",
    render: (vars) => ({
      title: "Creators Chamber Update",
      lines: [
        `The Executive Producer ${vars.execName || "Marc Hann"} tried to negotiate a contract with the Creator ${vars.creatorName || "Creator Name"}, and signed them.`,
        `Handle: ${vars.handle || "@CreatorsChamber"}`
      ],
      type: "ccc",
      handle: "@CreatorsChamber"
    })
  },
  cccDeclined: {
    id: "cccDeclined",
    title: "CCC: Declined",
    type: "ccc",
    render: (vars) => ({
      title: "Creators Chamber Update",
      lines: [
        `The Executive Producer ${vars.execName || "Marc Hann"} tried to negotiate a contract with the Creator ${vars.creatorName || "Creator Name"}, and they declined.`,
        `Handle: ${vars.handle || "@CreatorsChamber"}`
      ],
      type: "ccc",
      handle: "@CreatorsChamber"
    })
  },
  cccReconsider: {
    id: "cccReconsider",
    title: "CCC: Reconsidering",
    type: "ccc",
    render: (vars) => ({
      title: "Creators Chamber Update",
      lines: [
        `The Executive Producer ${vars.execName || "Marc Hann"} tried to negotiate a contract with the Creator ${vars.creatorName || "Creator Name"}, and they're reconsidering, stay tuned!`,
        `Handle: ${vars.handle || "@CreatorsChamber"}`
      ],
      type: "ccc",
      handle: "@CreatorsChamber"
    })
  },
  chartNews: {
    id: "chartNews",
    title: "Chart News",
    type: "chart",
    render: (vars) => ({
      title: vars.title || "Charts Updated",
      lines: vars.lines || [`#1: ${vars.top || "Unknown"}`],
      type: "chart",
      handle: "@GaiaCharts"
    })
  },
  systemNotice: {
    id: "systemNotice",
    title: "System Notice",
    type: "system",
    render: (vars) => ({
      title: vars.title || "Notice",
      lines: vars.lines || [vars.text || "System update"],
      type: "system",
      handle: "@System"
    })
  },
  musicVideo: {
    id: "musicVideo",
    title: "Music Video",
    type: "promo",
    render: (vars) => {
      const promo = promoDefaults(vars);
      return {
        title: `Music Video: ${promo.trackTitle}`,
        lines: [
          `${promo.actName} premieres the music video for "${promo.trackTitle}".`,
          `Requirement: ${vars.requirement || "Final video + clearance"}`,
          `Cost: ${promoCost(vars.cost, 7500)}`,
          `Premiere window: ${promo.releaseDate}`
        ],
        type: "promo"
      };
    }
  },
  livePerformance: {
    id: "livePerformance",
    title: "Live Performance",
    type: "promo",
    render: (vars) => {
      const promo = promoDefaults(vars);
      return {
        title: `Live Performance: ${promo.actName}`,
        lines: [
          `${promo.actName} performs "${promo.trackTitle}" at ${vars.venue || "Live Venue"}.`,
          `Requirement: ${vars.requirement || "Venue slot + live-ready set"}`,
          `Cost: ${promoCost(vars.cost, 3000)}`,
          `Set length: ${vars.setLength || "30-45 minutes"}`
        ],
        type: "promo"
      };
    }
  },
  eyeriSocialPost: {
    id: "eyeriSocialPost",
    title: "eyeriSocial Post",
    type: "promo",
    render: (vars) => {
      const promo = promoDefaults(vars);
      return {
        title: `eyeriSocial Post: ${promo.trackTitle}`,
        lines: [
          `${promo.actName} drops a hype post for "${promo.trackTitle}".`,
          `Requirement: ${vars.requirement || "Cover art + caption"}`,
          `Cost: ${promoCost(vars.cost, 600)}`,
          `Post window: ${promo.releaseDate}`
        ],
        type: "promo"
      };
    }
  },
  eyeriSocialAd: {
    id: "eyeriSocialAd",
    title: "eyeriSocial Ad",
    type: "promo",
    render: (vars) => {
      const promo = promoDefaults(vars);
      return {
        title: `eyeriSocial Ad: ${promo.trackTitle}`,
        lines: [
          `${promo.actName} launches a multimedia ad for "${promo.trackTitle}".`,
          `Requirement: ${vars.requirement || "Multimedia post + placement"}`,
          `Cost: ${promoCost(vars.cost, 1800)}`,
          `Placement window: ${promo.releaseDate}`
        ],
        type: "promo"
      };
    }
  },
  interview: {
    id: "interview",
    title: "Interview",
    type: "promo",
    render: (vars) => {
      const promo = promoDefaults(vars);
      return {
        title: `Interview: ${promo.actName}`,
        lines: [
          `${promo.actName} discusses "${promo.trackTitle}".`,
          `Outlet: ${vars.outlet || "Signal FM"}`,
          `Requirement: ${vars.requirement || "Press kit + talking points"}`,
          `Cost: ${promoCost(vars.cost, 1200)}`,
          `Lead time: ${vars.leadTime || "7-10 days"}`
        ],
        type: "promo"
      };
    }
  }
};

function postFromTemplate(id, vars = {}) {
  const tpl = SOCIAL_TEMPLATES[id];
  if (!tpl) return;
  const payload = tpl.render(vars);
  const handle = payload.handle || vars.handle || "@Gaia";
  postSocial({
    handle,
    title: payload.title,
    lines: payload.lines,
    text: payload.text,
    type: payload.type,
    order: vars.order || 0
  });
}
