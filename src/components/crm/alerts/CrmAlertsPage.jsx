"use client";

import AlertsView from "@/components/crm/alerts/AlertsView";
import { useCrmShell } from "@/components/crm/shell/CrmShellContext";

export default function CrmAlertsPage() {
  const {
    notifications,
    unreadCount,
    handleMarkAllAsRead,
    handleReadNotification,
    handleDeleteNotification,
  } = useCrmShell();

  return (
    <AlertsView
      notifications={notifications}
      unreadCount={unreadCount}
      handleMarkAllAsRead={handleMarkAllAsRead}
      handleReadNotification={handleReadNotification}
      handleDeleteNotification={handleDeleteNotification}
    />
  );
}
