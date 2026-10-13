export function createStaticCms() {
  return {
    items: [],
    block: (_key, fallback = {}) => fallback,
    list: (_key, _field, fallback = []) => fallback,
  };
}
