import { createRoot } from "react-dom/client";
import { CalendarModalIsland } from "./islands/CalendarModalIsland";
import { PillsDemoIsland } from "./islands/PillsDemoIsland";
import { TrackSlotsIsland } from "./islands/TrackSlotsIsland";
import "./styles.css";

function mountIsland(id: string, element: JSX.Element) {
  const rootEl = document.getElementById(id);
  if (!rootEl) return;
  const root = createRoot(rootEl);
  root.render(element);
}

const reactIslandsEnabled =
  typeof window !== "undefined"
  && (window.UI_REACT_ISLANDS_ENABLED === undefined || window.UI_REACT_ISLANDS_ENABLED);

if (typeof document !== "undefined" && reactIslandsEnabled) {
  mountIsland("rls-react-pills-root", <PillsDemoIsland />);
  mountIsland("rls-react-calendar-root", <CalendarModalIsland />);
  mountIsland("rls-react-trackslots-root", <TrackSlotsIsland />);
}
