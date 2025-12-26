import React from "react";
import { useRlsState } from "../bridge/useRlsState";
import { Pill } from "../components/Pill";
import { Tag } from "../components/Tag";

export function PillsDemoIsland() {
  const state = useRlsState();

  if (!state) {
    return <div className="muted">UI tokens waiting for state.</div>;
  }

  const stage = state.ui?.createStage || "sheet";
  const alignment = state.label?.alignment || "Neutral";
  const labelName = state.label?.name || "Record Label";

  return (
    <div className="rls-react-section">
      <div className="tiny muted">React UI tokens (demo)</div>
      <div className="rls-react-token-row">
        <Pill label={`Stage: ${stage}`} size="sm" />
        <Tag label={alignment} size="sm" />
        <Pill label={labelName} size="sm" />
      </div>
    </div>
  );
}
