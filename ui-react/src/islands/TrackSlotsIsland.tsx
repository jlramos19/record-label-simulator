import React, { useEffect, useMemo } from "react";
import { useRlsState } from "../bridge/useRlsState";
import { Pill } from "../components/Pill";
import { Tag } from "../components/Tag";

const ROLE_CONFIG = [
  {
    role: "Songwriter",
    key: "songwriterIds",
    label: "Songwriter",
    slotLabel: "Songwriter Slot",
    targetBase: "track-writer"
  },
  {
    role: "Performer",
    key: "performerIds",
    label: "Vocalist",
    slotLabel: "Vocalist Slot",
    targetBase: "track-performer"
  },
  {
    role: "Producer",
    key: "producerIds",
    label: "Producer",
    slotLabel: "Producer Slot",
    targetBase: "track-producer"
  }
];

const DEFAULT_VISIBLE = 3;

function safeAvatarUrl(url) {
  return String(url || "").replace(/\"/g, "%22").replace(/'/g, "%27");
}

function resolveRoleLimit(state, role, fallbackLength) {
  const limits = window.TRACK_ROLE_LIMITS || {};
  const fromGlobal = Number(limits[role]);
  if (Number.isFinite(fromGlobal) && fromGlobal > 0) return fromGlobal;
  if (Number.isFinite(fallbackLength) && fallbackLength > 0) return fallbackLength;
  return 1;
}

function resolveVisibleCount({ limit, assigned, current }) {
  const fallback = Math.min(DEFAULT_VISIBLE, limit);
  const base = Number.isFinite(current) ? current : fallback;
  return Math.max(fallback, Math.min(limit, Math.max(base, assigned)));
}

function renderCreatorLabel(creator, fallbackLabel) {
  if (!creator) return fallbackLabel;
  const stageName = typeof creator.stageName === "string" ? creator.stageName.trim() : "";
  const name = String(creator.name || stageName || "").trim();
  if (stageName && name && stageName !== name) {
    return (
      <span className="name-stack">
        <span className="creator-stage-name">{stageName}</span>
        <span className="muted">[{name}]</span>
      </span>
    );
  }
  return name || stageName || fallbackLabel;
}

export function TrackSlotsIsland() {
  const state = useRlsState();

  useEffect(() => {
    const legacy = document.getElementById("trackSlotGrid");
    if (!legacy) return;
    legacy.classList.add("hidden");
    return () => legacy.classList.remove("hidden");
  }, []);

  if (!state) {
    return <div className="muted">Track slots waiting for state.</div>;
  }

  const creators = Array.isArray(state.creators) ? state.creators : [];
  const creatorById = useMemo(() => {
    const map = new Map();
    creators.forEach((creator) => {
      if (creator?.id) map.set(creator.id, creator);
    });
    return map;
  }, [creators]);

  const activeStage = state.ui?.createStage || "sheet";
  const activeRole = activeStage === "demo" ? "Performer" : activeStage === "master" ? "Producer" : "Songwriter";
  const slotTarget = state.ui?.slotTarget || null;
  const trackSlots = state.ui?.trackSlots || {};
  const visible = state.ui?.trackSlotVisible || {};
  const columnSize = Number(window.STUDIO_COLUMN_SLOT_COUNT) || 5;
  const unassignedLabel = window.UNASSIGNED_CREATOR_LABEL || "Unassigned";

  return (
    <div className="rls-react-trackslots">
      {ROLE_CONFIG.map((entry) => {
        const ids = Array.isArray(trackSlots[entry.key]) ? trackSlots[entry.key].slice() : [];
        const limit = resolveRoleLimit(state, entry.role, ids.length);
        while (ids.length < limit) ids.push(null);
        const assignedCount = ids.filter(Boolean).length;
        const visibleCount = resolveVisibleCount({
          limit,
          assigned: assignedCount,
          current: Number(visible[entry.role])
        });
        const columns = Math.max(1, Math.ceil(limit / columnSize));
        const isActive = entry.role === activeRole;

        return (
          <div
            key={entry.role}
            className={`slot-role-group${isActive ? " is-active" : ""}`}
            data-slot-role-group={entry.role}
          >
            <div className="slot-group-head">
              <div className="slot-group-label" data-slot-group-label={entry.role}>
                {entry.label} Slots
              </div>
              <div className="slot-group-actions">
                <Pill label={`${assignedCount}/${limit}`} size="sm" />
                {isActive ? <Tag label="Active Stage" size="sm" /> : null}
                <button type="button" className="ghost mini" data-slot-more={entry.role}>Add Slot</button>
                <button type="button" className="ghost mini" data-slot-less={entry.role}>Show Less</button>
              </div>
            </div>
            <div className="slot-role-grid" data-slot-role-grid={entry.role}>
              {Array.from({ length: columns }).map((_, columnIndex) => {
                const columnStart = columnIndex * columnSize + 1;
                const showColumn = columnStart <= visibleCount;
                return (
                  <React.Fragment key={`${entry.role}-col-${columnIndex}`}>
                    <div
                      className={`slot-column-label${showColumn ? "" : " hidden"}`}
                      data-slot-column-label={`${entry.role}-${columnIndex + 1}`}
                      data-slot-role={entry.role}
                      data-slot-column-start={String(columnStart)}
                    >
                      Studio {columnIndex + 1}
                    </div>
                    {Array.from({ length: columnSize }).map((__, rowIndex) => {
                      const index = columnIndex * columnSize + rowIndex + 1;
                      if (index > limit) return null;
                      const slotId = `${entry.targetBase}-${index}`;
                      const creatorId = ids[index - 1];
                      const creator = creatorId ? creatorById.get(creatorId) : null;
                      const hidden = index > visibleCount;
                      const active = slotTarget === slotId;
                      const portraitUrl = creator?.portraitUrl || "";
                      const avatarStyle = portraitUrl ? { backgroundImage: `url(\"${safeAvatarUrl(portraitUrl)}\")` } : undefined;
                      const avatarClass = [
                        "slot-avatar",
                        portraitUrl ? "has-image" : "",
                        !creator ? "is-empty" : ""
                      ].filter(Boolean).join(" ");

                      return (
                        <div
                          key={slotId}
                          className={`id-slot${active ? " active" : ""}${hidden ? " hidden" : ""}`}
                          data-slot-target={slotId}
                          data-slot-type="creator"
                          data-slot-role={entry.role}
                          data-slot-group="track"
                          data-slot-index={String(index)}
                        >
                          <div className="slot-label">{entry.slotLabel} {index}</div>
                          <div className="slot-id">
                            <div className={avatarClass} style={avatarStyle} aria-hidden="true"></div>
                            <div className="slot-value">
                              {renderCreatorLabel(creator, unassignedLabel)}
                            </div>
                          </div>
                          <div className="slot-actions">
                            <button type="button" className="ghost mini" data-slot-recommend={slotId}>Recommend</button>
                            <button type="button" className="ghost mini" data-slot-clear={slotId}>Clear</button>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
