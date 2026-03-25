import { z } from "zod";
import { getXeroAttachment } from "../../handlers/get-xero-attachment.handler.js";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import type { AttachmentEntityType } from "../../handlers/list-xero-attachments.handler.js";

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

const GetAttachmentTool = CreateXeroTool(
  "get-attachment",
  "Download an attachment from a Xero entity by file name. Use list-attachments first to see available files and their content types. Returns the file content as base64-encoded data.",
  {
    entityType: z
      .enum(entityTypes)
      .describe("The type of Xero entity the attachment belongs to."),
    entityId: z
      .string()
      .describe("The unique Xero ID of the entity."),
    fileName: z
      .string()
      .describe(
        "The file name of the attachment to download (from list-attachments).",
      ),
    contentType: z
      .string()
      .describe(
        "The MIME type of the attachment (from list-attachments). e.g. 'application/pdf', 'image/jpeg'",
      ),
  },
  async ({ entityType, entityId, fileName, contentType, tenantId }) => {
    const response = await getXeroAttachment(
      entityType as AttachmentEntityType,
      entityId,
      fileName,
      contentType,
      tenantId,
    );

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error downloading attachment: ${response.error}`,
          },
        ],
      };
    }

    const attachment = response.result;

    if (!attachment) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Attachment not found: ${fileName}`,
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Downloaded: ${attachment.fileName}`,
            `Type: ${attachment.contentType}`,
            `Size: ${Math.round(attachment.sizeBytes / 1024)} KB`,
            `Base64 content (${attachment.contentBase64.length} chars):`,
          ].join("\n"),
        },
        {
          type: "text" as const,
          text: attachment.contentBase64,
        },
      ],
    };
  },
);

export default GetAttachmentTool;
