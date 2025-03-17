import { ConfidentialClientApplication } from "@azure/msal-node";

export const getAppToken = async (
  msalClient: ConfidentialClientApplication
): Promise<string> => {
  const tokenResponse = await msalClient.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"],
  });

  if (tokenResponse!.accessToken) {
    return tokenResponse!.accessToken;
  }

  throw new Error("Failed to obtain access token.");
  console.error(tokenResponse);
};
