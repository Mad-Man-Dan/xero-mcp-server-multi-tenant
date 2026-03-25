import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { ZodRawShapeCompat } from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { z } from "zod";

const tenantIdSchema = {
  tenantId: z
    .string()
    .optional()
    .describe(
      "Optional tenant/organisation ID override. If omitted, uses the active tenant. Use list-xero-tenants to see available options.",
    ),
};

type TenantIdSchema = typeof tenantIdSchema;

export const CreateXeroTool =
  <Args extends ZodRawShapeCompat>(
    name: string,
    description: string,
    schema: Args,
    handler: ToolCallback<Args & TenantIdSchema>,
  ): (() => ToolDefinition<ZodRawShapeCompat>) =>
  () => ({
    name: name,
    description: description,
    schema: { ...tenantIdSchema, ...schema },
    handler: handler as unknown as ToolCallback<ZodRawShapeCompat>,
  });
