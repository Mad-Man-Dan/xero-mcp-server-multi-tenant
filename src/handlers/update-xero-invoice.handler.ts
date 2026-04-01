import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Invoice, LineItemTracking } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitAmount: number;
  accountCode: string;
  taxType: string;
  itemCode?: string;
  tracking?: LineItemTracking[];
}

async function getInvoice(invoiceId: string, tenantId?: string): Promise<Invoice | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  // First, get the current invoice to check its status
  const response = await xeroClient.accountingApi.getInvoice(
    resolvedTenantId,
    invoiceId, // invoiceId
    undefined, // unitdp
    getClientHeaders(), // options
  );

  return response.body.invoices?.[0];
}

async function updateInvoice(
  invoiceId: string,
  lineItems?: InvoiceLineItem[],
  reference?: string,
  dueDate?: string,
  date?: string,
  contactId?: string,
  status?: Invoice.StatusEnum,
  tenantId?: string,
): Promise<Invoice | undefined> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);

  const invoice: Invoice = {
    lineItems: lineItems,
    reference: reference,
    dueDate: dueDate,
    date: date,
    contact: contactId ? { contactID: contactId } : undefined,
    status: status,
  };

  const response = await xeroClient.accountingApi.updateInvoice(
    resolvedTenantId,
    invoiceId,
    {
      invoices: [invoice],
    },
    undefined, // unitdp
    undefined, // idempotencyKey
    getClientHeaders(),
  );

  return response.body.invoices?.[0];
}

/**
 * Update an existing invoice in Xero
 */
export async function updateXeroInvoice(
  invoiceId: string,
  lineItems?: InvoiceLineItem[],
  reference?: string,
  dueDate?: string,
  date?: string,
  contactId?: string,
  status?: Invoice.StatusEnum,
  tenantId?: string,
): Promise<XeroClientResponse<Invoice>> {
  try {
    const existingInvoice = await getInvoice(invoiceId, tenantId);
    const invoiceStatus = existingInvoice?.status;

    // Status-only changes (approve, void, delete) are allowed on non-draft invoices
    const isStatusChangeOnly =
      status && !lineItems && !reference && !dueDate && !date && !contactId;

    // Field edits are only allowed on DRAFT or SUBMITTED invoices
    if (
      !isStatusChangeOnly &&
      invoiceStatus !== Invoice.StatusEnum.DRAFT &&
      invoiceStatus !== Invoice.StatusEnum.SUBMITTED
    ) {
      return {
        result: null,
        isError: true,
        error: `Cannot edit invoice fields because status is ${invoiceStatus}. Only status transitions (e.g. VOIDED) are allowed on authorised invoices.`,
      };
    }

    const updatedInvoice = await updateInvoice(
      invoiceId,
      lineItems,
      reference,
      dueDate,
      date,
      contactId,
      status,
      tenantId,
    );

    if (!updatedInvoice) {
      throw new Error("Invoice update failed.");
    }

    return {
      result: updatedInvoice,
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
