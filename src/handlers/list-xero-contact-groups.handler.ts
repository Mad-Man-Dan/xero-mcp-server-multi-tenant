import { xeroClient } from "../clients/xero-client.js";
import { ContactGroup } from "xero-node";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function getContactGroups(contactGroupId?: string, tenantId?: string): Promise<ContactGroup[]> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  if (contactGroupId) {
    const response = await xeroClient.accountingApi.getContactGroup(
      resolvedTenantId,
      contactGroupId,
      getClientHeaders(),
    );
    return response.body.contactGroups ?? [];
  }

  const response = await xeroClient.accountingApi.getContactGroups(
    resolvedTenantId,
    undefined, // where
    undefined, // order
    getClientHeaders(),
  );
  return response.body.contactGroups ?? [];
}

/**
 * List all contact groups from Xero. If a contactGroupId is provided, it will return only that contact group.
 */
export async function listXeroContactGroups(contactGroupId?: string, tenantId?: string): Promise<
  XeroClientResponse<ContactGroup[]>
> {
  try {
    const contactGroups = await getContactGroups(contactGroupId, tenantId);

    return {
      result: contactGroups,
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
