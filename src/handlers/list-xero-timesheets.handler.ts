import { Timesheet } from "xero-node/dist/gen/model/payroll-nz/timesheet.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getTimesheets(tenantId?: string): Promise<Timesheet[]> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  // Call the Timesheets endpoint from the PayrollNZApi
  const timesheets = await xeroClient.payrollNZApi.getTimesheets(
    resolvedTenantId,
    undefined, // page
    undefined, // filter
  );

  return timesheets.body.timesheets ?? [];
}

/**
 * List all payroll timesheets from Xero
 */
export async function listXeroPayrollTimesheets(tenantId?: string): Promise<
  XeroClientResponse<Timesheet[]>
> {
  try {
    const timesheets = await getTimesheets(tenantId);

    return {
      result: timesheets,
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