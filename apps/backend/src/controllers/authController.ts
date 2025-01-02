import { Request, Response } from "express";
import { AuthorizationCode } from "simple-oauth2";
import { config } from "common";

const oauth2Client = new AuthorizationCode({
  client: {
    id: config.MICROSOFT_CLIENT_ID,
    secret: config.MICROSOFT_CLIENT_SECRET,
  },
  auth: {
    tokenHost: "https://login.microsoftonline.com",
    tokenPath: `/${config.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
    authorizePath: `/${config.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize`,
  },
});

// Authenticate (OAuth redirect)
export const authenticate = (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7);
  const authorizationUri = oauth2Client.authorizeURL({
    redirect_uri: config.MICROSOFT_REDIRECT_URI,
    scope: "https://graph.microsoft.com/.default",
    state,
  });

  res.redirect(authorizationUri);
};

// Callback (handle OAuth response)
export const callback = async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: "Missing code or state." });
  }

  let parsedState;
  try {
    parsedState = JSON.parse(state as string);
  } catch (error) {
    return res.status(400).json({ error: "Invalid state parameter." });
  }

  const { csrfToken, discordId } = parsedState;

  if (!csrfToken || !discordId) {
    return res.status(400).json({ error: "Missing CSRF token or discordId." });
  }

  try {
    const tokenParams = {
      code: code as string,
      redirect_uri: config.MICROSOFT_REDIRECT_URI,
      scope: "https://graph.microsoft.com/.default",
    };

    const accessTokenResponse = await oauth2Client.getToken(tokenParams);
    const accessToken = accessTokenResponse.token.access_token;

    const updateResponse = await fetch(`https://graph.microsoft.com/v1.0/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        businessPhones: [`${discordId}`], // PoC
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update user with discordId.");
    }

    res.status(200).send("Successfully authenticated and linked with Discord!");
  } catch (error) {
    console.error("Error during authentication callback:", error);
    res.status(500).json({ error: "Authentication failed." });
  }
};
