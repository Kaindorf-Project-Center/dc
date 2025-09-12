import type { User } from '@microsoft/microsoft-graph-types';
import { config } from '../../config';
import type { Result } from '../../utils/tryCatch';
import { graphClientWithToken } from './graph';
import type { UsersSearchResponse } from '../interfaces/UsersSearchResponse';
import { pendingByDiscordId } from 'src/interfaces/Pending';
import { createT } from 'src/i18n/i18n';
import { resolveLangByLocale } from 'src/i18n/language';

export async function setUserDiscordId(
	accessToken: string,
	userId: string,
	discordId: string,
): Promise<Result<true, Error>> {
	console.log(`Updating discordId for user: ${userId}...`);

	const p = pendingByDiscordId.get(discordId);
	const t = createT(resolveLangByLocale(p.locale));

	const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, '');

	const graph = graphClientWithToken(accessToken);

	const filterQuery = `extension_${clientIdNoDashes}_discordId eq '${discordId}'`;

	// TODO: missing error handling
	const searchResponse = (await graph
		.api('/users')
		.filter(encodeURIComponent(filterQuery))
		.select('id,displayName,userPrincipalName,surname,givenName,mail')
		.get()) as UsersSearchResponse;

	if (searchResponse.value && searchResponse.value.length > 0) {
		const user: User = searchResponse.value[0];
		if (user.id == userId) {
			return { data: true, error: null };
		}
		console.log('A user with that Discord ID already exists.');
		return { data: null, error: new Error(t('callback.discordIdAlreadyUsed')) };
	}
	else {
		graph
			.api(`/users${userId}`)
			.update({ [`extension_${clientIdNoDashes}_discordId`]: discordId })
			.catch((r) => {
				console.log(`Failed to update discordId ${r}`);
				return {
					data: null,
					error: new Error(t('common.errors.patchUser')),
				};
			});
	}

	console.log(`Successfully updated discordId for ${userId}`);

	return { data: true, error: null };
}
