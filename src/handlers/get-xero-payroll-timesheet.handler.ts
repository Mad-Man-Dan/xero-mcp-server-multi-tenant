import { Timesheet } from "xero-node/dist/gen/model/payroll-nz/timesheet.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function getTimesheet(timesheetID: string, tenantId?: string): Promise<Timesheet | null> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  // Call the Timesheet endpoint from the PayrollNZApi
  const timesheet = await xeroClient.payrollNZApi.getTimesheet(
    resolvedTenantId,
    timesheetID,
  );

  return timesheet.body.timesheet ?? null;
}

/**
 * Get a single payroll timesheet from Xero
 */
export async function getXeroPayrollTimesheet(timesheetID: string, tenantId?: string): Promise<
  XeroClientResponse<Timesheet | null>
> {
  try {
    const timesheet = await getTimesheet(timesheetID, tenantId);

    return {
      result: timesheet,
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