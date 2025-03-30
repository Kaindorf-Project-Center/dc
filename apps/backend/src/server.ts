import express, { Request, Response, NextFunction } from "express";
import { router } from "./routes/index";
import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { config } from "common";
import { createExtensionAttributeIfNotExists } from "./helpers/createExtensionAttributeIfNotExists";
import { getAppToken } from "./helpers/tokens";

const msalConfig: Configuration = {
  auth: {
    clientId: config.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID}`,
    clientSecret: config.MICROSOFT_CLIENT_SECRET,
  },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

async function initializeApp() {
  console.log("Initializing application...");

  try {
    const accessToken = await getAppToken(msalClient);

    if (await createExtensionAttributeIfNotExists(accessToken)) {
      console.log("Application initialized successfully.");
    }
  } catch (e: any) {
    console.error(e.message);
    process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.use("/", router);

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeApp();
