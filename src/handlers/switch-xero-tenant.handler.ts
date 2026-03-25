import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

interface SwitchTenantResult {
  tenantId: string;
  tenantName: string;
}

async function switchTenant(tenantId: string): Promise<SwitchTenantResult> {
  await xeroClient.authenticate();

  xeroClient.switchTenantId(tenantId);

  const tenant = xeroClient
    .getTenants()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .find((t: any) => t.tenantId === tenantId);

  return {
    tenantId: tenantId,
    tenantName: tenant?.tenantName ?? "Unknown",
  };
}

/**
 * Switch the active Xero tenant/organisation
 */
export async function switchXeroTenant(
  tenantId: string,
): Promise<XeroClientResponse<SwitchTenantResult>> {
  try {
    const result = await switchTenant(tenantId);

    return {
      result: result,
      isError: false,
      error: null,
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}
