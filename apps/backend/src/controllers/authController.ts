import { Request, Response } from 'express';
import { config } from 'common';
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
    //return res.status(303).redirect('discord://');
    return res.status(400).render('error', {
      message: 'Missing code or state.',
      statusCode: '400',
    });
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
    return res.status(500).render('error', {
      message: 'Failed to acquire access token.',
      statusCode: '500',
    });
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
    return res.status(500).render('error', {
      message: 'Failed to fetch user data.',
      statusCode: '500',
    });
  }

  const userData = await userResponse.data.json();
  const userId = userData.id;
  console.log('Authenticated user ID:', userId);

  const appToken = await getAppToken(msalClient);

  if (appToken.error != null) {
    return res.status(500).render('error', {
      message: 'Failed to get AppToken',
      statusCode: '500',
    });
  }

  const setUserDiscordIdResult = await setUserDiscordId(
    appToken.data,
    userId,
    discordId
  );

  if (
    setUserDiscordIdResult.error &&
    setUserDiscordIdResult.error.message === 'discordId already used'
  ) {
    console.error(setUserDiscordIdResult.error);
    return res.status(400).render('error', {
      message:
        'Der verwendete Discord-Account ist bereits mit einem anderen Microsoft-Schulkonto Assoziiert.',
      statusCode: '400',
    });
  }

  res.status(200).render('success');
};
