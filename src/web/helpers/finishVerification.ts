import type { GuildMember, Message } from 'discord.js';
import { tryCatch } from '../../utils/tryCatch';
import { getMappingForLetter } from '../../utils/mapping';
import { getOrCreateRole } from '../../utils/getOrCreateRole';
import {
	createAuthErrorContainer,
	createAuthSuccessContainer,
} from '../../utils/authComponents';
import type { TFunction } from 'src/i18n/i18n';

export async function finishVerification(
	member: GuildMember,
	message: Message,
	user: { givenName: string; surname: string; userPrincipalName: string },
	t: TFunction,
) {
	const shorthand = user.userPrincipalName.split('@')[0];
	const userShorthandMatch = shorthand.match(/[a-z]{5}([abcdnmzy])(\d\d)/);
	if (!userShorthandMatch) {
		await tryCatch(
			message.edit({
				components: [createAuthErrorContainer(t, t('verify.wrongAbbr'))],
			}),
		);
		return;
	}

	const mapping = (await getMappingForLetter(userShorthandMatch[1])).data!;
	const deptRole = (await getOrCreateRole(member, mapping.department)).data!;
	const classRole = (
		await getOrCreateRole(member, mapping.longname + userShorthandMatch[2])
	).data!;

	// Edit users server profile
	// TODO: reverse steps if somthing fails
	const deptRoleResult = await tryCatch(member.roles.add(deptRole));
	if (deptRoleResult.error) {
		await tryCatch(
			message.edit({
				components: [
					createAuthErrorContainer(
						t, 'Abteilungsrolle konnte nicht hinzugefügt werden',
					),
				],
			}),
		);
		throw new Error('couldnt add deptRole');
	}

	const classRoleResult = await tryCatch(member.roles.add(classRole));
	if (classRoleResult.error) {
		await tryCatch(
			message.edit({
				components: [
					createAuthErrorContainer(
						t, 'Klassenrollen konnte nicht hinzugefügt werden',
					),
				],
			}),
		);
		throw new Error('couldnt add classRole');
	}

	const nicknameResult = await tryCatch(
		member.setNickname(`${user.givenName} ${user.surname}`),
	);
	if (nicknameResult.error) {
		console.log(nicknameResult.error);
		await tryCatch(
			message.edit({
				components: [
					createAuthErrorContainer(t, 'Spitzname konnte nicht gesetzt werden'),
				],
			}),
		);
		throw new Error('couldnt set nickname');
	}

	await tryCatch(message.edit({ components: [createAuthSuccessContainer(t)] }));
}
