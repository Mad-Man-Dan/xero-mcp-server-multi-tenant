import { z } from "zod";
import { uploadXeroAttachment } from "../../handlers/upload-xero-attachment.handler.js";
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

const UploadAttachmentTool = CreateXeroTool(
  "upload-attachment",
  "Upload an attachment to a Xero entity. Provide either base64-encoded file content or a local file path. For invoices and credit notes, you can optionally include the attachment in the online document.",
  {
    entityType: z
      .enum(entityTypes)
      .describe("The type of Xero entity to attach the file to."),
    entityId: z
      .string()
      .describe("The unique Xero ID of the entity."),
    fileName: z
      .string()
      .describe(
        "The file name for the attachment including extension. e.g. 'receipt.pdf', 'photo.jpg'",
      ),
    base64Content: z
      .string()
      .optional()
      .describe(
        "Base64-encoded file content. Provide this OR filePath, not both.",
      ),
    filePath: z
      .string()
      .optional()
      .describe(
        "Absolute path to a local file to upload. Provide this OR base64Content, not both.",
      ),
    includeOnline: z
      .boolean()
      .optional()
      .describe(
        "For invoices and credit notes only: include the attachment when the document is viewed online.",
      ),
  },
  async ({
    entityType,
    entityId,
    fileName,
    base64Content,
    filePath,
    includeOnline,
    tenantId,
  }) => {
    if (!base64Content && !filePath) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: provide either base64Content or filePath.",
          },
        ],
      };
    }

    const source = base64Content
      ? { base64: base64Content }
      : { filePath: filePath! };

    const response = await uploadXeroAttachment(
      entityType as AttachmentEntityType,
      entityId,
      fileName,
      source,
      includeOnline,
      tenantId,
    );

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error uploading attachment: ${response.error}`,
          },
        ],
      };
    }

    const attachment = response.result;

    return {
      content: [
        {
          type: "text" as const,
          text: [
            `Attachment uploaded successfully.`,
            `File: ${attachment?.fileName}`,
            `ID: ${attachment?.attachmentID}`,
            `Type: ${attachment?.mimeType}`,
            attachment?.url ? `URL: ${attachment.url}` : null,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
    };
  },
);

export default UploadAttachmentTool;
