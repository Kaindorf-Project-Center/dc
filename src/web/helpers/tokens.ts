import type { ConfidentialClientApplication } from '@azure/msal-node';
import type { Result } from '../../utils/tryCatch';
import { tryCatch } from '../../utils/tryCatch';

export const getAppToken = async (
	msalClient: ConfidentialClientApplication,
): Promise<Result<string, Error>> => {
	const tokenResponse = await tryCatch(
		msalClient.acquireTokenByClientCredential({
			scopes: ['https://graph.microsoft.com/.default'],
		}),
	);

	if (tokenResponse.error) return { data: null, error: tokenResponse.error };

	if (tokenResponse.data == null) {return { data: null, error: new Error('tokenResponse.data is null') };}

	return { data: tokenResponse.data.accessToken, error: null };
};
