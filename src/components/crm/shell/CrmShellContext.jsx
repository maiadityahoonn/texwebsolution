"use client";

import { createContext, useContext } from "react";

export const CrmShellContext = createContext(null);

export function useCrmShell() {
  const value = useContext(CrmShellContext);
  if (!value) {
    throw new Error("useCrmShell must be used inside CrmAppLayout");
  }
  return value;
}
