import { Request, Response } from "express";
import { config } from "common";

// Verify a Discord user
export const verifyUser = async (req: Request, res: Response) => {
  const { discordId } = req.params;

  if (!discordId) {
    return res.status(400).json({ error: "Missing Discord ID." });
  }

  try {
    // Fetch the user's profile from Microsoft Graph API
    const accessToken = await getAdminAccessToken(); // Replace with a function to get an admin token
    const userResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users?$filter=extensions/discordExtension/discordId eq '${discordId}'`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user profile.");
    }

    const userData = await userResponse.json();

    const userExists = userData.value && userData.value.length > 0;

    if (userExists) {
      return res.status(200).json({ success: true, message: "User verified." });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ error: "Internal Server Error." });
  }
};

// Helper function to get an admin access token
const getAdminAccessToken = async (): Promise<string> => {
  const response = await fetch(
    `https://login.microsoftonline.com/${config.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: config.MICROSOFT_CLIENT_ID,
        client_secret: config.MICROSOFT_CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "https://graph.microsoft.com/.default",
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get admin access token.");
  }

  const data = await response.json();
  return data.access_token;
};
