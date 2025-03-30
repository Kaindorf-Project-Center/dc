import { Request, Response } from "express";
import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";
import { config } from "common";
import { createExtensionAttributeIfNotExists } from "../helpers/createExtensionAttributeIfNotExists";
import { msalClient } from "../server";
import { setUserDiscordId } from "../helpers/setUserDiscordId";
import { getAppToken } from "../helpers/tokens";

// Authenticate (OAuth redirect)
export const authenticate = async (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(7); // Generate a random state for security
  const authCodeUrlParams = {
    scopes: ["https://graph.microsoft.com/.default"],
    redirectUri: config.MICROSOFT_REDIRECT_URI,
    state, // Add the state to prevent CSRF attacks
  };

  try {
    const authCodeUrl = await msalClient.getAuthCodeUrl(authCodeUrlParams);

    res.redirect(authCodeUrl); // Redirect the user to Microsoft login
  } catch (error) {
    console.error("Error generating authentication URL:", error);
    res.status(500).send("Failed to generate authentication URL.");
  }
};

// Callback (handle OAuth response)
export const callback = async (req: Request, res: Response) => {
  const { code, state: encodedState } = req.query;

  if (!code || !encodedState) {
    return res.status(400).json({ error: "Missing code or state." });
  }

  let decodedState: { csrf: string; discordId: string };
  try {
    decodedState = JSON.parse(
      Buffer.from(encodedState as string, "base64").toString("utf-8")
    );
  } catch (err) {
    console.error("State decoding failed:", err);
    return res.status(400).json({ error: "Invalid state parameter." });
  }

  // Retrieve the CSRF token and Discord ID from the decoded state
  const { csrf, discordId } = decodedState;
  console.log("CSRF Token:", csrf);
  console.log("Discord ID:", discordId);

  try {
    const tokenRequest = {
      code: code as string,
      scopes: ["https://graph.microsoft.com/.default"],
      redirectUri: config.MICROSOFT_REDIRECT_URI,
    };

    const response = await msalClient.acquireTokenByCode(tokenRequest);
    const accessToken = response?.accessToken;

    if (!accessToken) {
      throw new Error("Failed to acquire access token.");
    }

    // Step 2: Get the authenticated user's profile
    const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      throw new Error(
        `Failed to fetch user data: ${await userResponse.text()}`
      );
    }

    const userData = await userResponse.json();
    const userId = userData.id;
    console.log("Authenticated user ID:", userId);

    await setUserDiscordId(await getAppToken(msalClient), userId, discordId);

    res
      .status(303)
      .redirect("https://discord.com/channels/@me/1327542033954639933");
  } catch (error: any) {
    if (error.message == "userId already authenticated") {
      res
        .status(303)
        .redirect("https://discord.com/channels/@me/1327542033954639933");
    } else {
      console.error("Error during authentication callback:", error);
      res.status(500).json({ error: "Authentication failed." });
    }
  }
};
