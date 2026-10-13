"use client";

import EntityChatPanel from "@/components/crm/shared/EntityChatPanel";

export default function DealChatTab({ selectedDeal, currentUser, currentProfile }) {
  if (!selectedDeal?.id) return null;

  return (
    <EntityChatPanel
      entityType="deal"
      entityId={selectedDeal.id}
      title="Internal Deal Chat"
      subtitle="Deal-specific sales discussion. This history stays separate from other clients."
      department="sales"
      currentUser={currentUser}
      currentProfile={currentProfile}
    />
  );
}
