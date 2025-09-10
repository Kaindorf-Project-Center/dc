import express, { Request, Response, NextFunction } from 'express';
import { router } from './web/routes/index';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { createExtensionAttributeIfNotExists } from './web/helpers/createExtensionAttributeIfNotExists';
import { getAppToken } from './web/helpers/tokens';
import path from 'path';
import { config } from './config';

const msalConfig: Configuration = {
  auth: {
    clientId: config.MICROSOFT_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID}`,
    clientSecret: config.MICROSOFT_CLIENT_SECRET,
  },
};

export const msalClient = new ConfidentialClientApplication(msalConfig);

export async function initializeWebServer() {
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

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'web', 'views'));

  app.use('/static', express.static(path.join(__dirname, 'web', 'public')));

  app.use(express.json());

  app.use('/', router);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
