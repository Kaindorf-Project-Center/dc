import type { User } from '@microsoft/microsoft-graph-types';
import { config } from '../../config';
import type { Result } from '../../utils/tryCatch';
import { graphClientWithToken } from './graph';
import type { UsersSearchResponse } from '../interfaces/UsersSearchResponse';
import { createT } from 'src/i18n/i18n';
import { resolveLangByLocale } from 'src/i18n/language';
import { pendingAuthByDiscordId } from 'src/interfaces/Pending';

export async function setUserDiscordId(
	accessToken: string,
	userId: string,
	// should only be null if you want to delete the discordId of a user in entra
	discordId: string | null,
): Promise<Result<true, Error>> {
	console.log(`Updating discordId(${discordId}) for user: ${userId}...`);

	const p = pendingAuthByDiscordId.get(discordId);
	const t = createT(resolveLangByLocale(p.locale));

	const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, '');

	const graph = graphClientWithToken(accessToken);

	if (discordId !== null) {
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
		} else {
			try {
				await graph
					.api(`/users/${userId}`)
					.update({ [`extension_${clientIdNoDashes}_discordId`]: discordId });

				console.log(`Successfully updated discordId for ${userId}`);
				return { data: true, error: null };
			} catch (r) {
				console.log('Failed to update discordId', r);
				return { data: null, error: new Error(t('common.errors.patchUser')) };
			}
		}
	}

	return { data: true, error: null };
}
