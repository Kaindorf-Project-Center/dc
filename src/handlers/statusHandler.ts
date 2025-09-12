import type { Result } from '../utils/tryCatch';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import {
	getAllDepartments,
	getAllPostfixes,
	parseYamlToMap,
} from '../utils/mapping';
import { config } from '../config';
import { msalClient } from 'src/server';
import { graphClientWithToken } from 'src/web/helpers/graph';
import type { UsersSearchResponse } from 'src/web/interfaces/UsersSearchResponse';
import { getT } from 'src/i18n/language';

export async function handleStatus(
	member: GuildMember,
	interaction: ChatInputCommandInteraction,
): Promise<Result<void, Error>> {
	const t = getT(interaction);

	const microsoftStatus = await handleMicrosoftStatus(member);
	const microsoftStatusEmbed = new EmbedBuilder()
		.setTitle(
			'Microsoft ' + t('status.title') + ': ' + (microsoftStatus ? '✅' : '❌'),
		)
		.setDescription(
			microsoftStatus ? t('status.authenticatd') : t('status.notAuthenticated'),
		)
		.setColor(microsoftStatus ? 'Green' : 'Red');

	// TODO: check if the name and roles from microsoft match those in discord
	const discordStatus = await handleDiscordStatus(member);

	const discordStatusEmbed = new EmbedBuilder()
		.setTitle(
			'Discord ' + t('status.title') + ': ' + (discordStatus ? '✅' : '❌'),
		)
		.setDescription(
			discordStatus ? t('status.authenticatd') : t('status.notAuthenticated'),
		)
		.setColor(discordStatus ? 'Green' : 'Red');

	await interaction.reply({
		embeds: [microsoftStatusEmbed, discordStatusEmbed],
	});

	return { data: null, error: new Error() };
}

async function handleMicrosoftStatus(member: GuildMember): Promise<boolean> {
	const clientIdNoDashes = config.MICROSOFT_CLIENT_ID.replace(/-/g, '');

	// Acquire an application token (client credentials flow)
	const tokenRequest = {
		scopes: ['https://graph.microsoft.com/.default'],
	};

	const tokenResponse = await msalClient.acquireTokenByClientCredential(
		tokenRequest,
	);
	const accessToken = tokenResponse?.accessToken;

	if (!accessToken) {
		// TODO: should be an error
		return false;
	}

	const graph = graphClientWithToken(accessToken);

	const filterQuery = `extension_${clientIdNoDashes}_discordId eq '${member.id}'`;

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
		console.log(searchResponse.value);
		return true;
	} else {
		// No user found with that Discord ID
		return false;
	}
}

async function handleDiscordStatus(member: GuildMember): Promise<boolean> {
	if (member.nickname == null) return false;
	const nicknameMatch = member.nickname.match(
		/^[A-Z][a-z]+(?:-[A-Z][a-z]+)?\s[A-Z]+(?:[-\s][A-Z]+)?$/,
	);

	const departmentMap = await parseYamlToMap();
	// TODO: should be an ERROR
	if (departmentMap.error != null) return false;

	const allDepartmentsResult = getAllDepartments(departmentMap.data);
	// TODO: should be an ERROR
	if (allDepartmentsResult.error) return false;

	const hasDepartmentRole =
		member.roles.cache.find((r) =>
			allDepartmentsResult.data.includes(r.name),
		) != null;

	const allPostfixesResult = getAllPostfixes(departmentMap.data);
	// TODO: should be an ERROR
	if (allPostfixesResult.error) return false;

	const postfixRegex = new RegExp(
		`^(${allPostfixesResult.data.join('|')})\\d{2}$`,
	);

	const hasClassRole = member.roles.cache.some((r) =>
		postfixRegex.test(r.name),
	);

	return nicknameMatch != null && hasDepartmentRole && hasClassRole;
}
