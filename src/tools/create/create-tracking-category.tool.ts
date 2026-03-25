import { z } from "zod";
import { CreateXeroTool } from "../../helpers/create-xero-tool.js";
import { createXeroTrackingCategory } from "../../handlers/create-xero-tracking-category.handler.js";

const CreateTrackingCategoryTool = CreateXeroTool(
  "create-tracking-category",
  `Create a tracking category in Xero.`,
  {
    name: z.string()
  },
  async ({ name, tenantId }) => {
    const response = await createXeroTrackingCategory(name, tenantId);

    if (response.isError) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error while creating tracking category: ${response.error}`
          }
        ]
      };
    }

    const trackingCategory = response.result;
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Created the tracking category "${trackingCategory.name}" (${trackingCategory.trackingCategoryID}).`
        },
      ]
    };
  }
);

export default CreateTrackingCategoryTool;