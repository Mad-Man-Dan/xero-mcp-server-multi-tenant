import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Quote } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

async function getQuotes(
  contactId: string | undefined,
  page: number,
  quoteNumber: string | undefined,
  tenantId?: string,
): Promise<Quote[]> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const quotes = await xeroClient.accountingApi.getQuotes(
    resolvedTenantId,
    undefined, // ifModifiedSince
    undefined, // dateFrom
    undefined, // dateTo
    undefined, // expiryDateFrom
    undefined, // expiryDateTo
    contactId, // contactID
    undefined, // status
    page,
    undefined, // order
    quoteNumber, // quoteNumber
    getClientHeaders(),
  );
  return quotes.body.quotes ?? [];
}

/**
 * List all quotes from Xero
 */
export async function listXeroQuotes(
  page: number = 1,
  contactId?: string,
  quoteNumber?: string,
  tenantId?: string,
): Promise<XeroClientResponse<Quote[]>> {
  try {
    const quotes = await getQuotes(contactId, page, quoteNumber, tenantId);

    return {
      result: quotes,
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
