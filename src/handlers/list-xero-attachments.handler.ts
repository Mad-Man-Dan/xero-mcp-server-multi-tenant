import { xeroClient } from "../clients/xero-client.js";
import { XeroClientResponse } from "../types/tool-response.js";
import { formatError } from "../helpers/format-error.js";
import { Attachment } from "xero-node";
import { getClientHeaders } from "../helpers/get-client-headers.js";

export type AttachmentEntityType =
  | "account"
  | "bankTransaction"
  | "bankTransfer"
  | "contact"
  | "creditNote"
  | "invoice"
  | "manualJournal"
  | "purchaseOrder"
  | "quote"
  | "receipt"
  | "repeatingInvoice";

async function listAttachments(
  entityType: AttachmentEntityType,
  entityId: string,
  tenantId?: string,
): Promise<Attachment[]> {
  await xeroClient.authenticate();
  const resolvedTenantId = xeroClient.resolveTenantId(tenantId);
  const headers = getClientHeaders();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let response: any;

  switch (entityType) {
    case "account":
      response = await xeroClient.accountingApi.getAccountAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "bankTransaction":
      response =
        await xeroClient.accountingApi.getBankTransactionAttachments(
          resolvedTenantId,
          entityId,
          headers,
        );
      break;
    case "bankTransfer":
      response = await xeroClient.accountingApi.getBankTransferAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "contact":
      response = await xeroClient.accountingApi.getContactAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "creditNote":
      response = await xeroClient.accountingApi.getCreditNoteAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "invoice":
      response = await xeroClient.accountingApi.getInvoiceAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "manualJournal":
      response =
        await xeroClient.accountingApi.getManualJournalAttachments(
          resolvedTenantId,
          entityId,
          headers,
        );
      break;
    case "purchaseOrder":
      response =
        await xeroClient.accountingApi.getPurchaseOrderAttachments(
          resolvedTenantId,
          entityId,
          headers,
        );
      break;
    case "quote":
      response = await xeroClient.accountingApi.getQuoteAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "receipt":
      response = await xeroClient.accountingApi.getReceiptAttachments(
        resolvedTenantId,
        entityId,
        headers,
      );
      break;
    case "repeatingInvoice":
      response =
        await xeroClient.accountingApi.getRepeatingInvoiceAttachments(
          resolvedTenantId,
          entityId,
          headers,
        );
      break;
    default:
      throw new Error(`Unsupported entity type: ${entityType}`);
  }

  return response.body.attachments ?? [];
}

/**
 * List all attachments on a Xero entity
 */
export async function listXeroAttachments(
  entityType: AttachmentEntityType,
  entityId: string,
  tenantId?: string,
): Promise<XeroClientResponse<Attachment[]>> {
  try {
    const attachments = await listAttachments(entityType, entityId, tenantId);

    return {
      result: attachments,
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
