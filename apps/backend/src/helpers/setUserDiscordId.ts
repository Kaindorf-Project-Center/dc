import { User } from "@microsoft/microsoft-graph-types";
import { config } from "common";

export async function setUserDiscordId(
  accessToken: string,
  userId: string,
  discordId: string
) {
  console.log(`Updating discordId for user: ${userId}...`);

  const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, "");

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

  if (searchResults.value && searchResults.value.length > 0) {
    const user: User = searchResults.value[0];
    if (user.id == userId) {
      throw Error("userId already authenticated");
    }
    console.log("A user with that Discord ID already exists.");
    throw Error("discordId already used");
  } else {
    const patchResponse = await fetch(
      `https://graph.microsoft.com/v1.0/users/${userId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [`extension_${clientIdNoDashes}_discordId`]: discordId,
        }),
      }
    );

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      throw new Error(`Failed to patch user: ${errorText}`);
    }
  }

  console.log(`Successfully updated discordId for ${userId}`);
}
