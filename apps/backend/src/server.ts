import express, { Request, Response, NextFunction } from 'express';
import { router } from './routes/index';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { config } from 'common';
import { createExtensionAttributeIfNotExists } from './helpers/createExtensionAttributeIfNotExists';
import { getAppToken } from './helpers/tokens';

const msalConfig: Configuration = {
  auth: {
    clientId: config.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID}`,
    clientSecret: config.MICROSOFT_CLIENT_SECRET,
  },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

async function initializeApp() {
  console.log('Initializing application...');

  const accessToken = await getAppToken(msalClient);

  if (accessToken.error) {
    console.error(accessToken.error);
    return process.exit(1);
  }

  if ((await createExtensionAttributeIfNotExists(accessToken.data)) == null) {
    return process.exit(1);
  }

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.use('/', router);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initializeApp();
