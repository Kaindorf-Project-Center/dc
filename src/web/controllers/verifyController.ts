import { config } from '../../config';
import type { Request, Response } from 'express';
import { msalClient } from '../../server';
import { graphClientWithToken } from '../helpers/graph';
import type { UsersSearchResponse } from '../interfaces/UsersSearchResponse';

export const verify = async (req: Request, res: Response) => {
	const { discordId } = req.params;

	// Remove hyphens from the client ID for proper extension attribute naming
	const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, '');

	// Acquire an application token (client credentials flow)
	const tokenRequest = {
		scopes: ['https://graph.microsoft.com/.default'],
	};

	try {
		const tokenResponse = await msalClient.acquireTokenByClientCredential(
			tokenRequest,
		);
		const accessToken = tokenResponse?.accessToken;

		if (!accessToken) {
			return res.status(500).json({ error: 'Failed to acquire access token.' });
		}

		const graph = graphClientWithToken(accessToken);

		const filterQuery = `extension_${clientIdNoDashes}_discordId eq '${discordId}'`;

		// TODO: missing error handling
		const searchResponse = (await graph
			.api('/users')
			.filter(encodeURIComponent(filterQuery))
			.select('id,displayName,userPrincipalName,surname,givenName,mail')
			.get()
			.catch((r) => {
				console.log(r);
			})) as UsersSearchResponse;

		if (searchResponse.value && searchResponse.value.length > 0) {
			// User found – they are authenticated (i.e. have completed the OAuth flow)
			return res.json({
				message: 'User is authenticated',
				user: searchResponse.value[0],
			});
		}
		else {
			// No user found with that Discord ID
			return res
				.status(404)
				.json({ message: 'User not found or not authenticated.' });
		}
	}
	catch (error) {
		console.error('Error verifying user:', error);
		return res.status(500).json({ error: 'Internal server error.' });
	}
};
