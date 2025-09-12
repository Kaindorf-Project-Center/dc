import { config } from '../../config';
import type { Request, Response } from 'express';
import { msalClient } from '../../server';
import { graphClientWithToken } from '../helpers/graph';
import type { UsersSearchResponse } from '../interfaces/UsersSearchResponse';
import { pendingAuthByDiscordId } from 'src/interfaces/Pending';
import { createT } from 'src/i18n/i18n';
import { resolveLangByLocale } from 'src/i18n/language';

export const verify = async (req: Request, res: Response) => {
	const { discordId } = req.params;
	const p = pendingAuthByDiscordId.get(discordId);
	const t = createT(resolveLangByLocale(p?.locale));

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
			return res.status(500).json({ error: t('callback.accessTokenError') });
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
				message: t('verify.authenticated'),
				user: searchResponse.value[0],
			});
		} else {
			// No user found with that Discord ID
			return res.status(404).json({ message: t('verify.notFoundOr404') });
		}
	} catch (error) {
		console.error('Error verifying user:', error);
		return res.status(500).json({ error: t('common.errors._505') });
	}
};
