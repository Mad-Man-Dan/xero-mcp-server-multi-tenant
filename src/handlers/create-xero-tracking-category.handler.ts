import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { TrackingCategory } from "xero-node";

async function createTrackingCategory(
  name: string,
  tenantId?: string
): Promise<TrackingCategory | undefined> {
  xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const trackingCategory: TrackingCategory = {
    name: name
  };

  const response = await xeroClient.accountingApi.createTrackingCategory(
    resolvedTenantId, // xeroTenantId
    trackingCategory,
    undefined, // idempotencyKey
    getClientHeaders() // options
  );

  const createdTrackingCategory = response.body.trackingCategories?.[0];

  return createdTrackingCategory;
}

export async function createXeroTrackingCategory(
  name: string,
  tenantId?: string
): Promise<XeroClientResponse<TrackingCategory>> {
  try {
    const createdTrackingCategory = await createTrackingCategory(name, tenantId);

    if (!createdTrackingCategory) {
      throw new Error("Tracking Category creation failed.");
    }

    return {
      result: createdTrackingCategory,
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