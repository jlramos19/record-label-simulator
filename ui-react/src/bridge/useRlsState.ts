import { useEffect, useState } from "react";
import { getRlsState, subscribe } from "./state";

export function useRlsState() {
  const [state, setState] = useState(() => getRlsState());

  useEffect(() => {
    setState(getRlsState());
    return subscribe(() => setState(getRlsState()));
  }, []);

  return state;
}
