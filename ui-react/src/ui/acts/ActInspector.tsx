import React from "react";
import type { ActSummary } from "./ActList";

type Props = {
  act: ActSummary | null;
};

export default function ActInspector({ act }: Props) {
  if (!act) {
    return (
      <div className="rls-panel">
        <div className="rls-panel-title">Act Inspector</div>
        <div className="rls-panel-muted">Select an act to view production context.</div>
      </div>
    );
  }

  return (
    <div className="rls-panel">
      <div className="rls-panel-title">{act.name}</div>
      <div className="rls-panel-muted">{act.genre}</div>
      <div className="rls-panel-grid">
        <div>
          <div className="rls-panel-label">Status</div>
          <div>{act.status}</div>
        </div>
        <div>
          <div className="rls-panel-label">Momentum</div>
          <div>{act.momentum}</div>
        </div>
        <div>
          <div className="rls-panel-label">Next Move</div>
          <div>Assign a track to the Production Pipeline.</div>
        </div>
      </div>
    </div>
  );
}
