export function upsertById(list, row, limit = 200) {
  if (!row?.id) return list;
  const next = [row, ...list.filter((item) => item.id !== row.id)];
  return next.slice(0, limit);
}

export function mergeById(list, row) {
  if (!row?.id) return list;
  let found = false;
  const next = list.map((item) => {
    if (item.id !== row.id) return item;
    found = true;
    return { ...item, ...row };
  });
  return found ? next : [row, ...next];
}

export function removeById(list, row) {
  const id = row?.id;
  if (!id) return list;
  return list.filter((item) => item.id !== id);
}

export function patchRealtimeList(setter, payload, { limit = 200, onInsert } = {}) {
  const eventType = payload?.eventType;
  const row = eventType === "DELETE" ? payload?.old : payload?.new;
  if (!row?.id) return;
  setter((prev) => {
    if (eventType === "DELETE") return removeById(prev, row);
    if (eventType === "UPDATE") return mergeById(prev, row);
    return upsertById(prev, row, limit);
  });
  if (eventType === "INSERT") onInsert?.(row);
}
