import { config } from 'common';

export function getAuthUrl(encodedState: string): string {
  return `https://login.microsoftonline.com/${
    config.MICROSOFT_TENANT_ID
  }/oauth2/v2.0/authorize?client_id=${
    config.MICROSOFT_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    config.MICROSOFT_REDIRECT_URI
  )}&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&state=${encodedState}`;
}
