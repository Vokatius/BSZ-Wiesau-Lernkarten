import { disbandOrgUsers } from "@quenti/enterprise/users";
import { env } from "@quenti/env/server";
import { cancelOrganizationSubscription } from "@quenti/payments";
import { prisma } from "@quenti/prisma";

import { inngest } from "../inngest";

export const scheduleOrgDeletion = inngest.createFunction(
  {
    name: "Schedule organization deletion",
  },
  {
    event: "orgs/delete",
  },
  async ({ event, step }) => {
    if (env.SERVER_NAME === "production") {
      await step.sleep("48h");
    }

    await cancelOrganizationSubscription(event.data.org.id);

    const deleted = await prisma.organization.delete({
      where: {
        id: event.data.org.id,
      },
    });

    await disbandOrgUsers(deleted.id);
  },
);
