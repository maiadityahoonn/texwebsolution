"use client";

import AuthenticatedWorkspace from "@/components/workspace/AuthenticatedWorkspace";

export default function WorkspacePage() {
  return <AuthenticatedWorkspace defaultSection="overview" />;
}
