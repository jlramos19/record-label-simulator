import React from "react";

export type ActSummary = {
  id: string;
  name: string;
  genre: string;
  status: string;
  momentum: string;
};

type RowProps = {
  act: ActSummary;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

function ActRow({ act, selected, onSelect }: RowProps) {
  return (
    <button
      type="button"
      className={`rls-act-row${selected ? " is-selected" : ""}`}
      onClick={() => onSelect?.(act.id)}
    >
      <div className="rls-act-row-title">{act.name}</div>
      <div className="rls-act-row-meta">{act.genre} · {act.status} · {act.momentum}</div>
    </button>
  );
}

const ActList = {
  Row: ActRow
};

export default ActList;
