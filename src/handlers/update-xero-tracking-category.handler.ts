import { TrackingCategory } from "xero-node";
import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

type TrackingCategoryStatus = "ACTIVE" | "ARCHIVED";

async function getTrackingCategory(trackingCategoryId: string, tenantId?: string): Promise<TrackingCategory | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const response = await xeroClient.accountingApi.getTrackingCategory(
    resolvedTenantId,
    trackingCategoryId,
    getClientHeaders()
  );

  return response.body.trackingCategories?.[0];
}

async function updateTrackingCategory(
  trackingCategoryId: string,
  existingTrackingCategory: TrackingCategory,
  name?: string,
  status?: TrackingCategoryStatus,
  tenantId?: string
): Promise<TrackingCategory | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const trackingCategory: TrackingCategory = {
    trackingCategoryID: trackingCategoryId,
    name: name ? name : existingTrackingCategory.name,
    status: status ? TrackingCategory.StatusEnum[status] : existingTrackingCategory.status
  };

  await xeroClient.accountingApi.updateTrackingCategory(
    resolvedTenantId,
    trackingCategoryId,
    trackingCategory,
    undefined, // idempotencyKey
    getClientHeaders()
  );

  return trackingCategory;
}

export async function updateXeroTrackingCategory(
  trackingCategoryId: string,
  name?: string,
  status?: TrackingCategoryStatus,
  tenantId?: string
): Promise<XeroClientResponse<TrackingCategory>> {
  try {
    const existingTrackingCategory = await getTrackingCategory(trackingCategoryId, tenantId);

    if (!existingTrackingCategory) {
      throw new Error("Could not find tracking category.");
    }

    const updatedTrackingCategory = await updateTrackingCategory(
      trackingCategoryId,
      existingTrackingCategory,
      name,
      status,
      tenantId
    );

    if (!updatedTrackingCategory) {
      throw new Error("Failed to update tracking category.");
    }

    return {
      result: existingTrackingCategory,
      isError: false,
      error: null
    };
  } catch (error) {
    return {
      result: null,
      isError: true,
      error: formatError(error),
    };
  }
}