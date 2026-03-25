import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function deleteTimesheet(timesheetID: string, tenantId?: string): Promise<boolean> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  // Call the deleteTimesheet endpoint from the PayrollNZApi
  await xeroClient.payrollNZApi.deleteTimesheet(resolvedTenantId, timesheetID);

  return true;
}

/**
 * Delete an existing payroll timesheet in Xero
 */
export async function deleteXeroPayrollTimesheet(timesheetID: string, tenantId?: string): Promise<
  XeroClientResponse<boolean>
> {
  try {
    await deleteTimesheet(timesheetID, tenantId);

    return {
      result: true,
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