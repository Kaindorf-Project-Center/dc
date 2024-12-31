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

  try {
    const tokenParams = {
      code: code as string,
      redirect_uri: config.MICROSOFT_REDIRECT_URI,
      scope: "https://graph.microsoft.com/.default",
    };

    const accessToken = await oauth2Client.getToken(tokenParams);

    res
      .status(200)
      .send("Successfully authenticated! You can now use the Discord server.");
  } catch (error) {
    console.error("Error during authentication callback:", error);
    res.status(500).json({ error: "Authentication failed." });
  }
};
