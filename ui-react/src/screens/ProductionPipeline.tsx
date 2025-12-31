import React, { useMemo, useState } from "react";
import SplitPane from "@/ui/components/SplitPane";
import VirtualizedList from "@/ui/components/VirtualizedList";
import ActList, { ActSummary } from "@/ui/acts/ActList";
import ActInspector from "@/ui/acts/ActInspector";

const makeActs = (): ActSummary[] => ([
  { id: "act-001", name: "Lumen District", genre: "Alt Pop", status: "Ready", momentum: "Rising" },
  { id: "act-002", name: "Kite Theory", genre: "Indie Rock", status: "In Production", momentum: "Steady" },
  { id: "act-003", name: "Nova Pulse", genre: "Electro", status: "Awaiting Demo", momentum: "Volatile" },
  { id: "act-004", name: "Quiet Arcade", genre: "Synthwave", status: "Ready", momentum: "Surging" },
  { id: "act-005", name: "Juniper Bloom", genre: "Folk", status: "Awaiting Master", momentum: "Cooling" },
  { id: "act-006", name: "Signal Drift", genre: "Hip-Hop", status: "Ready", momentum: "Climbing" },
  { id: "act-007", name: "Velvet Circuit", genre: "R&B", status: "In Production", momentum: "Steady" },
  { id: "act-008", name: "Silver Walk", genre: "House", status: "Ready", momentum: "Rising" },
  { id: "act-009", name: "Hollow Era", genre: "Alt Rock", status: "Awaiting Demo", momentum: "Warming" },
  { id: "act-010", name: "Echo Lantern", genre: "Dream Pop", status: "Ready", momentum: "Surging" },
  { id: "act-011", name: "Crimson Tide", genre: "Rock", status: "Ready", momentum: "Warming" },
  { id: "act-012", name: "Iris Avenue", genre: "Pop", status: "In Production", momentum: "Rising" },
  { id: "act-013", name: "Low Orbit", genre: "Trap", status: "Awaiting Master", momentum: "Cooling" },
  { id: "act-014", name: "Winterline", genre: "Singer-Songwriter", status: "Ready", momentum: "Steady" },
  { id: "act-015", name: "Afterglow Youth", genre: "Indie Pop", status: "Ready", momentum: "Surging" }
]);

export default function ProductionPipeline() {
  const acts = useMemo(() => makeActs(), []);
  const [selectedId, setSelectedId] = useState<string | null>(acts[0]?.id || null);
  const selectedAct = acts.find((act) => act.id === selectedId) || null;

  return (
    <div className="rls-screen">
      <div className="rls-screen-header">
        <div>
          <div className="rls-title">Production Pipeline</div>
          <div className="rls-subtitle">Track assignments, readiness, and momentum at a glance.</div>
        </div>
        <div className="rls-badge">Live Preview</div>
      </div>
      <SplitPane
        left={(
          <VirtualizedList
            items={acts}
            itemHeight={56}
            renderItem={(act) => (
              <ActList.Row
                act={act}
                selected={act.id === selectedId}
                onSelect={setSelectedId}
              />
            )}
            className="rls-list"
          />
        )}
        right={<ActInspector act={selectedAct} />}
        minSizes={{ left: 280, right: 360 }}
        className="rls-split"
      />
    </div>
  );
}
