import type { GuildMember, ChatInputCommandInteraction } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { randomBytes } from 'crypto';

import type { Result } from '../utils/tryCatch';
import { tryCatch } from '../utils/tryCatch';
import {
  createAuthContainer,
  createTimeoutContainer,
} from '../utils/authComponents';
import { getAuthUrl } from '../utils/getAuthUrl';
import { pendingByDiscordId } from '../interfaces/pending';

export async function handleAuthentication(
  member: GuildMember,
  interaction?: ChatInputCommandInteraction
): Promise<Result<void, Error>> {
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
    'base64'
  );

  // Authentifizierungs-URL erstellen
  const authUrl = getAuthUrl(encodedState);

  const container = createAuthContainer(authUrl);

  let message;
  if (interaction) {
    const replyResult = await tryCatch(
      interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
        withResponse: true,
      })
    );
    if (replyResult.error) {
      return { data: null, error: replyResult.error };
    }

    message = replyResult.data.resource!.message!;
  } else {
    const sendResult = await tryCatch(
      dmChannel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      })
    );
    if (sendResult.error) {
      return { data: null, error: sendResult.error };
    }
    message = sendResult.data;
  }
  pendingByDiscordId.set(member.id, {
    csrf: csrfToken,
    guildId: member.guild.id,
    channelId: dmChannel.id,
    messageId: message.id,
    memberId: member.id,
  });

  const collector = dmChannel.createMessageComponentCollector({
    time: 60000 * 5,
  });

  collector.on('end', async (_collected, reason) => {
    if (reason === 'time') {
      const timeoutContainer = createTimeoutContainer();

      await tryCatch(message.edit({ components: [timeoutContainer] }));

      console.log(
        `Verifizierung für ${member.user.username} hat zu lange gedauert.`
      );
    } else {
      console.log(reason);

      console.log(`Collector für ${member.user.username} beendet.`);
    }
  });

  return { data: undefined, error: null };
}
