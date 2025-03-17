import { config } from "common";
import { Request, Response } from "express";
import { msalClient } from "../server";

export const verify = async (req: Request, res: Response) => {
  const { discordId } = req.params;

  // Remove hyphens from the client ID for proper extension attribute naming
  const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, "");

  // Acquire an application token (client credentials flow)
  const tokenRequest = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  try {
    const tokenResponse = await msalClient.acquireTokenByClientCredential(
      tokenRequest
    );
    const accessToken = tokenResponse?.accessToken;

    if (!accessToken) {
      return res.status(500).json({ error: "Failed to acquire access token." });
    }

    // Build the filter query to search for a user with the given Discord ID
    const filterQuery = `extension_${clientIdNoDashes}_discordId eq '${discordId}'`;
    const searchUrl = `https://graph.microsoft.com/v1.0/users?$filter=${encodeURIComponent(
      filterQuery
    )}`;

    const searchResponse = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      throw new Error(`Failed to search users: ${errorText}`);
    }

    const searchResults = await searchResponse.json();
    console.log(searchResults);

    if (searchResults.value && searchResults.value.length > 0) {
      // User found – they are authenticated (i.e. have completed the OAuth flow)
      return res.status(200).json({
        message: "User is authenticated",
        user: searchResults.value[0],
      });
    } else {
      // No user found with that Discord ID
      return res
        .status(404)
        .json({ message: "User not found or not authenticated." });
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
