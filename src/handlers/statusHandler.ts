import type { Result } from '../utils/tryCatch';
import { tryCatch } from '../utils/tryCatch';
import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import {
	getAllDepartments,
	getAllPostfixes,
	parseYamlToMap,
} from '../utils/mapping';
import { config } from '../config';

export async function handleStatus(
	member: GuildMember,
	interaction: ChatInputCommandInteraction,
): Promise<Result<void, Error>> {
	const microsoftStatus = await handleMicrosoftStatus(member);
	const microsoftStatusEmbed = new EmbedBuilder()
		.setTitle('Microsoft status: ' + (microsoftStatus ? '✅' : '❌'))
		.setDescription(
			microsoftStatus ? 'authentifiziert' : 'nicht authentifiziert',
		)
		.setColor(microsoftStatus ? 'Green' : 'Red');

	// TODO: check if the name and roles from microsoft match those in discord
	const discordStatus = await handleDiscordStatus(member);
	const discordStatusEmbed = new EmbedBuilder()
		.setTitle('Discord status: ' + (discordStatus ? '✅' : '❌'))
		.setDescription(discordStatus ? 'authentifiziert' : 'nicht authentifiziert')
		.setColor(discordStatus ? 'Green' : 'Red');

	await interaction.reply({
		embeds: [microsoftStatusEmbed, discordStatusEmbed],
	});

	return { data: null, error: new Error() };
}

async function handleMicrosoftStatus(member: GuildMember): Promise<boolean> {
	const backendUrl = `${config.BACKEND_BASE_URL}/verify/${member.id}`;
	const fetchResult = await tryCatch(fetch(backendUrl, { method: 'GET' }));
	if (fetchResult.error || !fetchResult.data.ok) {
		return false; // TODO: should be an ERROR
	}

	const jsonResult = await tryCatch(fetchResult.data.json());
	if (jsonResult.error) {
		return false; // TODO: should be an ERROR
	}
	const user = jsonResult.data.user;
	return user != null;
}

async function handleDiscordStatus(member: GuildMember): Promise<boolean> {
	if (member.nickname == null) return false;
	const nicknameMatch = member.nickname.match(
		/^[A-Z][a-z]+(?:-[A-Z][a-z]+)?\s[A-Z]+(?:[-\s][A-Z]+)?$/,
	);

	const departmentMap = await parseYamlToMap();
	if (departmentMap.error != null) return false; // TODO: should be an ERROR

	const allDepartmentsResult = await getAllDepartments(departmentMap.data);
	if (allDepartmentsResult.error) return false; // TODO: should be an ERROR

	const hasDepartmentRole =
    member.roles.cache.find((r) =>
    	allDepartmentsResult.data.includes(r.name),
    ) != null;

	const allPostfixesResult = await getAllPostfixes(departmentMap.data);
	if (allPostfixesResult.error) return false; // TODO: should be an ERROR

	const postfixRegex = new RegExp(
		`^(${allPostfixesResult.data.join('|')})\\d{2}$`,
	);

	const hasClassRole = member.roles.cache.some((r) =>
		postfixRegex.test(r.name),
	);

	return nicknameMatch != null && hasDepartmentRole && hasClassRole;
}
