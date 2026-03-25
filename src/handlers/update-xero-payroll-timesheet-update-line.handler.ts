import {
  TimesheetLine,
} from "xero-node/dist/gen/model/payroll-nz/timesheetLine.js";

import { xeroClient } from "../clients/xero-client.js";
import { formatError } from "../helpers/format-error.js";
import { XeroClientResponse } from "../types/tool-response.js";

async function updateTimesheetLine(
  timesheetID: string,
  timesheetLineID: string,
  timesheetLine: TimesheetLine,
  tenantId?: string
): Promise<TimesheetLine | null> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  // Call the updateTimesheetLine endpoint from the PayrollNZApi
  const updatedLine = await xeroClient.payrollNZApi.updateTimesheetLine(
    resolvedTenantId,
    timesheetID,
    timesheetLineID,
    timesheetLine,
  );

  return updatedLine.body.timesheetLine ?? null;
}

/**
 * Update an existing timesheet line in a payroll timesheet in Xero
 */
export async function updateXeroPayrollTimesheetUpdateLine(
  timesheetID: string,
  timesheetLineID: string,
  timesheetLine: TimesheetLine,
  tenantId?: string
): Promise<XeroClientResponse<TimesheetLine | null>> {
  try {
    const updatedLine = await updateTimesheetLine(timesheetID, timesheetLineID, timesheetLine, tenantId);

    return {
      result: updatedLine,
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