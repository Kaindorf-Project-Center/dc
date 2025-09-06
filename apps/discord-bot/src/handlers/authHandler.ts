import {
  GuildMember,
  MessageComponentInteraction,
  ChatInputCommandInteraction,
  MessageFlags,
} from 'discord.js';
import { randomBytes } from 'crypto';
import { config } from 'common';
import { getMappingForLetter } from '../utils/mapping';
import { tryCatch, Result } from 'common/src/tryCatch';
import {
  createAuthContainer,
  createErrorContainer,
  createSuccessContainer,
  createTimeoutContainer,
} from '../utils/authComponents';
import { getOrCreateRole } from '../utils/getOrCreateRole';
import { getAuthUrl } from '../utils/getAuthUrl';

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

  // CSRF-Token und Statepayload erzeugen
  const csrfToken = randomBytes(16).toString('hex');
  const statePayload = { csrf: csrfToken, discordId: member.id };
  const encodedState = Buffer.from(JSON.stringify(statePayload)).toString(
    'base64'
  );

  // Authentifizierungs-URL erstellen
  const authUrl = getAuthUrl(encodedState);

  const container = createAuthContainer(member, authUrl);

  let message;
  if (interaction) {
    const replyResult = await tryCatch(
      interaction.reply({
        flags: MessageFlags.IsComponentsV2,
        components: [container],
      })
    );
    if (replyResult.error) {
      return { data: null, error: replyResult.error };
    }
    message = replyResult.data;
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

  const filter = (i: MessageComponentInteraction) =>
    i.isButton() && i.customId === `verify-${member.id}`;

  const collector = dmChannel.createMessageComponentCollector({
    filter,
    time: 60000 * 5,
  });

  collector.on('collect', async (buttonInteraction) => {
    console.log('leck eier');

    if (!buttonInteraction.isButton()) return;
    console.log('leck eier 2');

    const backendUrl = `${config.BACKEND_BASE_URL}/verify/${member.id}`;
    const fetchResult = await tryCatch(fetch(backendUrl, { method: 'GET' }));
    if (fetchResult.error || !fetchResult.data.ok) {
      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));

      buttonInteraction.deferUpdate();
      collector.stop('failed');
      return;
    }

    const jsonResult = await tryCatch(fetchResult.data.json());
    if (jsonResult.error) {
      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));

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
      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));
      collector.stop('failed');
      return;
    }

    const letter = userShorthandMatch[1];
    const mappingResult = await getMappingForLetter(letter);
    if (mappingResult.error) {
      console.error('Mapping-Fehler:', mappingResult.error);

      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));

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
      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));
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
      const errorContainer = createErrorContainer();

      await tryCatch(message.edit({ components: [errorContainer] }));
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

    const successContainer = createSuccessContainer();

    const editResult = await tryCatch(
      message.edit({ components: [successContainer] })
    );
    if (editResult.error) {
      console.error(editResult.error);
      collector.stop('failed');
    }

    collector.stop('verified');
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
