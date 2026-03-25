import { xeroClient } from "../clients/xero-client.js";
import { TrackingCategory } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";

async function getTrackingCategories(
  includeArchived?: boolean,
  tenantId?: string,
): Promise<TrackingCategory[]> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const response = await xeroClient.accountingApi.getTrackingCategories(
    resolvedTenantId, // xeroTenantId
    undefined, // where
    undefined, // order
    includeArchived, // includeArchived
    getClientHeaders()
  );

  return response.body.trackingCategories ?? [];
}

export async function listXeroTrackingCategories(
  includeArchived?: boolean,
  tenantId?: string,
): Promise<XeroClientResponse<TrackingCategory[]>> {
  try {
    const trackingCategories = await getTrackingCategories(includeArchived, tenantId);

    return {
      result: trackingCategories,
      isError: false,
      error: null
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error)
    };
  }
}