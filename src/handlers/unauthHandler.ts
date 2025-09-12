import type { GuildMember, ChatInputCommandInteraction, Interaction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { randomBytes } from 'crypto';

import type { Result } from '../utils/tryCatch';
import { tryCatch } from '../utils/tryCatch';
import { createAuthTimeoutContainer } from '../utils/authComponents';
import { pendingUnauthByDiscordId } from '../interfaces/Pending';
import { getUnauthUrl } from 'src/utils/getUnauthUrl';
import { createUnauthContainer } from 'src/utils/unauthComponents';
import { getT } from 'src/i18n/language';

export async function handleUnauthentication(
	member: GuildMember,
	interaction: ChatInputCommandInteraction,
): Promise<Result<true, Error>> {
	// DM-Channel erstellen
	const dmChannelResult = await tryCatch(member.createDM());
	if (dmChannelResult.error) {
		return { data: null, error: dmChannelResult.error };
	}
	const dmChannel = dmChannelResult.data;

	// CSRF-Token und Statepayload erzeugen
	const csrfToken = randomBytes(16).toString('hex');
	const statePayload = { csrf: csrfToken, discordId: member.id };
	const encodedState = Buffer.from(JSON.stringify(statePayload)).toString(
		'base64',
	);

	// Authentifizierungs-URL erstellen
	const authUrl = getUnauthUrl(encodedState);

	const t = getT(interaction ? interaction as Interaction : undefined);
	const container = createUnauthContainer(authUrl, t);

	let message;
	if (interaction) {
		const replyResult = await tryCatch(
			interaction.reply({
				flags: MessageFlags.IsComponentsV2,
				components: [container],
				withResponse: true,
			}),
		);
		if (replyResult.error) {
			return { data: null, error: replyResult.error };
		}

		message = replyResult.data.resource!.message!;
	} else {
		return { data: null, error: new Error('no interaction') };
	}

	pendingUnauthByDiscordId.set(member.id, {
		csrf: csrfToken,
		guildId: member.guild.id,
		channelId: dmChannel.id,
		messageId: message.id,
		memberId: member.id,
		locale: interaction.locale ?? undefined,
	});

	const collector = dmChannel.createMessageComponentCollector({
		time: 60000 * 5,
	});

	collector.on('end', (_collected, reason) => {
		if (reason === 'time') {
			const timeoutContainer = createAuthTimeoutContainer(t);
			void tryCatch(message.edit({ components: [timeoutContainer] }))
				.then(() => {
					console.log(
						`Unauth für ${member.user.username} hat zu lange gedauert.`,
					);
				})
				.catch(console.error);
		} else {
			console.log(reason);
			console.log(`Collector für ${member.user.username} beendet.`);
		}
	});
	return { data: true, error: null };
}
