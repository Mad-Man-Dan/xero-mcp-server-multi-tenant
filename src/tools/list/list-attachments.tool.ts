import { z } from "zod";
import {
  listXeroAttachments,
  AttachmentEntityType,
} from "../../handlers/list-xero-attachments.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";

const entityTypes = [
  "account",
  "bankTransaction",
  "bankTransfer",
  "contact",
  "creditNote",
  "invoice",
  "manualJournal",
  "purchaseOrder",
  "quote",
  "receipt",
  "repeatingInvoice",
] as const;

const ListAttachmentsTool = CreateXeroTool(
  "list-attachments",
  "List all attachments on a Xero entity (invoice, contact, bank transaction, manual journal, etc.). Returns attachment metadata including file name, MIME type, size, and URL.",
  {
    entityType: z
      .enum(entityTypes)
      .describe(
        "The type of Xero entity to list attachments for.",
      ),
    entityId: z
      .string()
      .describe("The unique Xero ID of the entity."),
  },
  async ({ entityType, entityId, tenantId }) => {
    const response = await listXeroAttachments(
      entityType as AttachmentEntityType,
      entityId,
      tenantId,
    );

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error listing attachments: ${response.error}`,
          },
        ],
      };
    }

    const attachments = response.result;

    if (!attachments || attachments.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `No attachments found on ${entityType} ${entityId}.`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: `Found ${attachments.length} attachment(s):`,
        },
        ...attachments.map((a) => ({
          type: "text" as const,
          text: [
            `File: ${a.fileName}`,
            `ID: ${a.attachmentID}`,
            `Type: ${a.mimeType}`,
            `Size: ${a.contentLength ? Math.round(a.contentLength / 1024) + " KB" : "Unknown"}`,
            a.url ? `URL: ${a.url}` : null,
            a.includeOnline ? "Included in online invoice" : null,
          ]
            .filter(Boolean)
            .join("\n"),
        })),
      ],
    };
  },
);

export default ListAttachmentsTool;
