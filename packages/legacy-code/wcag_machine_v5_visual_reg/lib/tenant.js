/**
 * Utility functions for tenant-aware keys.  A tenant ID allows you to run
 * multiple customers through the same pipeline without collisions.  If
 * TENANT_ID is not defined the default namespace "default" is used.
 */

export function getTenantId() {
  return process.env.TENANT_ID || 'default';
}

/**
 * Prefix a Redis or BullMQ queue name with the tenant namespace.  This
 * ensures that each tenant's data is isolated: e.g. `queue:scan` becomes
 * `t:<tenantId>:queue:scan`.
 */
export function prefixKey(key) {
  const tenant = getTenantId();
  // avoid double prefixing; if key already starts with t: we assume it's fine
  return key.startsWith('t:') ? key : `t:${tenant}:${key}`;
}