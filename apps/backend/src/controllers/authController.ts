import { Request, Response } from 'express';
import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { config } from 'common';
import { createExtensionAttributeIfNotExists } from '../helpers/createExtensionAttributeIfNotExists';
import { msalClient } from '../server';
import { setUserDiscordId } from '../helpers/setUserDiscordId';
import { getAppToken } from '../helpers/tokens';
import { tryCatch } from 'common/src/tryCatch';

export const authenticate = async (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const authCodeUrlParams = {
    scopes: ['https://graph.microsoft.com/.default'],
    redirectUri: config.MICROSOFT_REDIRECT_URI,
    state,
  };

  const authCodeUrl = await tryCatch(
    msalClient.getAuthCodeUrl(authCodeUrlParams)
  );

  if (authCodeUrl.error != null) {
    return res
      .status(500)
      .json({ error: 'Failed to generate authentication URL.' });
  }

  return res.redirect(authCodeUrl.data); // Redirect the user to Microsoft login
};

// Callback (handle OAuth response)
export const callback = async (req: Request, res: Response) => {
  const { code, state: encodedState } = req.query;

  if (!code || !encodedState) {
    return res.status(303).redirect('discord://');
    return res.status(400).json({ error: 'Missing code or state.' });
  }

  const decodedState = JSON.parse(
    Buffer.from(encodedState as string, 'base64').toString('utf-8')
  );

  // Retrieve the CSRF token and Discord ID from the decoded state
  const { csrf, discordId } = decodedState;
  console.log('CSRF Token:', csrf);
  console.log('Discord ID:', discordId);

  const tokenRequest = {
    code: code as string,
    scopes: ['https://graph.microsoft.com/.default'],
    redirectUri: config.MICROSOFT_REDIRECT_URI,
  };

  const tokenResponse = await tryCatch(
    msalClient.acquireTokenByCode(tokenRequest)
  );

  if (tokenResponse.error != null) {
    console.error(tokenResponse.error);
    return res.status(500).json({ error: 'Failed to acquire access token' });
  }

  const accessToken = tokenResponse.data.accessToken;

  // Step 2: Get the authenticated user's profile
  const userResponse = await tryCatch(
    fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
  );

  if (userResponse.error != null || !userResponse.data.ok) {
    return res.status(500).json({ error: 'Failed to fetch user data' });
  }

  const userData = await userResponse.data.json();
  const userId = userData.id;
  console.log('Authenticated user ID:', userId);

  const appToken = await getAppToken(msalClient);

  if (appToken.error != null) {
    return res.status(500).json({ error: 'Failed to get AppToken' });
  }

  const setUserDiscordIdResult = await setUserDiscordId(
    appToken.data,
    userId,
    discordId
  );

  if (setUserDiscordIdResult.error) {
    console.error(setUserDiscordIdResult.error);
    return res.status(500).send('A user with that Discord ID already exists.');
  }

  res.status(303).redirect('discord://');
};
