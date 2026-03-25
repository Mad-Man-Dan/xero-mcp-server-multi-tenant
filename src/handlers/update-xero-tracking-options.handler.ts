import { TrackingOption } from "xero-node";
import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";
import { XeroClientResponse } from "../types/tool-response.js";

type TrackingOptionStatus = "ACTIVE" | "ARCHIVED";

interface TrackingOptionItem {
  trackingOptionId: string,
  name?: string,
  status?: TrackingOptionStatus
}

async function getTrackingOptions(trackingCategoryId: string, tenantId?: string): Promise<TrackingOption[] | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const response = await xeroClient.accountingApi.getTrackingCategory(
    resolvedTenantId,
    trackingCategoryId,
    getClientHeaders()
  );

  return response.body.trackingCategories?.[0].options;
}

async function updateTrackingOption(
  trackingCategoryId: string,
  trackingOptionId: string,
  existingTrackingOption: TrackingOption,
  name?: string,
  status?: TrackingOptionStatus,
  tenantId?: string
): Promise<TrackingOption | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const trackingOption: TrackingOption = {
    trackingOptionID: trackingOptionId,
    name: name ? name : existingTrackingOption.name,
    status: status ? TrackingOption.StatusEnum[status] : existingTrackingOption.status
  };

  await xeroClient.accountingApi.updateTrackingOptions(
    resolvedTenantId,
    trackingCategoryId,
    trackingOptionId,
    trackingOption,
    undefined, // idempotencyKey
    getClientHeaders()
  );

  return trackingOption;
}

export async function updateXeroTrackingOption(
  trackingCategoryId: string,
  options: TrackingOptionItem[],
  tenantId?: string
): Promise<XeroClientResponse<TrackingOption[]>> {
  try {

    const existingTrackingOptions = await getTrackingOptions(trackingCategoryId, tenantId);

    if (!existingTrackingOptions) {
      throw new Error("Could not find tracking options.");
    }

    const updatedTrackingOptions = await Promise.all(options?.map(async (option) => {
      const existingTrackingOption = existingTrackingOptions
        .find(existingOption => existingOption.trackingOptionID === option.trackingOptionId);

      return existingTrackingOption
        ? await updateTrackingOption(trackingCategoryId, option.trackingOptionId, existingTrackingOption, option.name, option.status, tenantId)
        : undefined;
    }));

    if (!updatedTrackingOptions) {
      throw new Error("Failed to update tracking options.");
    }

    return {
      result: updatedTrackingOptions
        .filter(Boolean)
        .map(option => option as TrackingOption),
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