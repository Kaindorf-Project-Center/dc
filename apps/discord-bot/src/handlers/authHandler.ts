import {
  GuildMember,
  MessageComponentInteraction,
  ChatInputCommandInteraction,
} from 'discord.js';
import { randomBytes } from 'crypto';
import { config } from 'common';
import {
  createVerifyButton,
  createActionRow,
  createAuthButton,
} from '../utils/authButtons';
import { getMappingForLetter } from '../utils/mapping';
import { tryCatch, Result } from 'common/src/tryCatch';
import {
  createAuthEmbed,
  createErrorEmbed,
  createSuccessEmbed,
  createTimeoutEmbed,
} from '../utils/authEmbeds';
import { getOrCreateRole } from '../utils/getOrCreateRole';

export async function handleAuthentication(
  member: GuildMember,
  interaction: ChatInputCommandInteraction
): Promise<Result<void, Error>> {
  // DM-Channel erstellen
  const dmChannelResult = await tryCatch(member.createDM());
  if (dmChannelResult.error) {
    return { data: null, error: dmChannelResult.error };
  }
  const dmChannel = dmChannelResult.data;

  // CSRF-Token und Zustandspayload erzeugen
  const csrfToken = randomBytes(16).toString('hex');
  const statePayload = { csrf: csrfToken, discordId: member.id };
  const encodedState = Buffer.from(JSON.stringify(statePayload)).toString(
    'base64'
  );

  // Authentifizierungs-URL erstellen
  const authUrl = `https://login.microsoftonline.com/${
    config.MICROSOFT_TENANT_ID
  }/oauth2/v2.0/authorize?client_id=${
    config.MICROSOFT_CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURIComponent(
    config.MICROSOFT_REDIRECT_URI
  )}&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&state=${encodedState}`;

  const authEmbedResult = createAuthEmbed(authUrl);
  if (authEmbedResult.error) {
    return { data: null, error: authEmbedResult.error };
  }
  const authEmbed = authEmbedResult.data;

  let message;
  if (interaction) {
    const replyResult = await tryCatch(
      interaction.reply({
        embeds: [authEmbed],
        components: [],
        fetchReply: true,
      })
    );
    if (replyResult.error) {
      return { data: null, error: replyResult.error };
    }
    message = replyResult.data;
  } else {
    const sendResult = await tryCatch(
      dmChannel.send({
        embeds: [authEmbed],
        components: [],
      })
    );
    if (sendResult.error) {
      return { data: null, error: sendResult.error };
    }
    message = sendResult.data;
  }

  const verifyButtonResult = createVerifyButton(member.id);
  if (verifyButtonResult.error) {
    console.error(
      'Fehler beim Erzeugen des Verify-Buttons:',
      verifyButtonResult.error
    );
    return { data: null, error: verifyButtonResult.error };
  }

  const authButtonResult = createAuthButton(authUrl);
  if (authButtonResult.error) {
    console.error(
      'Fehler beim Erzeugen des Auth-Buttons:',
      authButtonResult.error
    );
    return { data: null, error: authButtonResult.error };
  }

  const actionRowResult = createActionRow([
    authButtonResult.data,
    verifyButtonResult.data,
  ]);
  if (actionRowResult.error) {
    console.error('Fehler beim Erzeugen der ActionRow:', actionRowResult.error);
    return { data: null, error: actionRowResult.error };
  }
  const editResult = await tryCatch(
    message.edit({ components: [actionRowResult.data] })
  );
  if (editResult.error) {
    console.error('Fehler beim Aktualisieren der Nachricht:', editResult.error);
  }

  const filter = (i: MessageComponentInteraction) =>
    i.isButton() && i.customId === `verify-${member.id}`;

  const collector = dmChannel.createMessageComponentCollector({
    filter,
    time: 60000 * 5,
  });

  collector.on('collect', async (buttonInteraction) => {
    if (!buttonInteraction.isButton()) return;

    const backendUrl = `${config.BACKEND_BASE_URL}/verify/${member.id}`;
    const fetchResult = await tryCatch(fetch(backendUrl, { method: 'GET' }));
    if (fetchResult.error || !fetchResult.data.ok) {
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      buttonInteraction.deferUpdate();
      collector.stop('failed');
      return;
    }

    const jsonResult = await tryCatch(fetchResult.data.json());
    if (jsonResult.error) {
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      buttonInteraction.deferUpdate();
      collector.stop('failed');
      return;
    }
    const user = jsonResult.data.user;

    const userShorthand: string = user.userPrincipalName.split('@')[0];
    const userShorthandMatch = userShorthand.match(
      /[a-z]{5}([abcdnmzy])(\d\d)/
    );
    if (!userShorthandMatch) {
      console.error('User-Shorthand entspricht nicht dem erwarteten Muster.');
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      collector.stop('failed');
      return;
    }

    const letter = userShorthandMatch[1];
    const mappingResult = await getMappingForLetter(letter);
    if (mappingResult.error) {
      console.error('Mapping-Fehler:', mappingResult.error);
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      collector.stop('failed');
      return;
    }
    const mapping = mappingResult.data;
    const department = mapping.department;
    const yarak = mapping.longname + userShorthandMatch[2];

    // Rollenzuweisung
    const deptRoleResult = await getOrCreateRole(member, department);
    if (deptRoleResult.error) {
      console.error(
        'Fehler beim Zuweisen der Abteilungsrolle:',
        deptRoleResult.error
      );
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      collector.stop('failed');
      return;
    }
    const addDeptRoleResult = await tryCatch(
      member.roles.add(deptRoleResult.data)
    );
    if (addDeptRoleResult.error) {
      console.error(
        'Fehler beim Hinzufügen der Abteilungsrolle:',
        addDeptRoleResult.error
      );
    }

    const classRoleResult = await getOrCreateRole(member, yarak);
    if (classRoleResult.error) {
      console.error(
        'Fehler beim Zuweisen der Klassenrolle:',
        classRoleResult.error
      );
      const errorEmbedResult = createErrorEmbed();
      if (!errorEmbedResult.error) {
        await tryCatch(
          message.edit({ embeds: [errorEmbedResult.data], components: [] })
        );
      }
      collector.stop('failed');
      return;
    }
    const addClassRoleResult = await tryCatch(
      member.roles.add(classRoleResult.data)
    );
    if (addClassRoleResult.error) {
      console.error(
        'Fehler beim Hinzufügen der Klassenrolle:',
        addClassRoleResult.error
      );
    }

    // Nickname aktualisieren
    const newNickname = `${user.givenName} ${user.surname}`;
    const setNicknameResult = await tryCatch(member.setNickname(newNickname));
    if (setNicknameResult.error) {
      console.error(
        'Fehler beim Setzen des Nicknames:',
        setNicknameResult.error
      );
    }

    const successEmbedResult = createSuccessEmbed();
    if (successEmbedResult.error) {
      console.error(
        'Fehler beim Erzeugen des Success-Embeds:',
        successEmbedResult.error
      );
    } else {
      await tryCatch(
        message.edit({ embeds: [successEmbedResult.data], components: [] })
      );
    }
    collector.stop('verified');
  });

  collector.on('end', async (_collected, reason) => {
    if (reason === 'time') {
      const timeoutEmbedResult = createTimeoutEmbed();
      if (timeoutEmbedResult.error) {
        console.error(
          'Fehler beim Erzeugen des Timeout-Embeds:',
          timeoutEmbedResult.error
        );
      } else {
        await tryCatch(
          message.edit({ embeds: [timeoutEmbedResult.data], components: [] })
        );
      }
      console.log(
        `Verifizierung für ${member.user.username} hat zu lange gedauert.`
      );
    } else {
      console.log(`Collector für ${member.user.username} beendet.`);
    }
  });

  return { data: undefined, error: null };
}
