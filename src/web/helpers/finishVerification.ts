import type { GuildMember, Message } from 'discord.js';
import { tryCatch } from '../../utils/tryCatch';
import { getMappingForLetter } from '../../utils/mapping';
import { getOrCreateRole } from '../../utils/getOrCreateRole';
import {
	createAuthErrorContainer,
	createAuthSuccessContainer,
} from '../../utils/authComponents';

export async function finishVerification(
	member: GuildMember,
	message: Message,
	user: { givenName: string; surname: string; userPrincipalName: string },
) {
	const shorthand = user.userPrincipalName.split('@')[0];
	const userShorthandMatch = shorthand.match(/[a-z]{5}([abcdnmzy])(\d\d)/);
	if (!userShorthandMatch) {
		await tryCatch(
			message.edit({
				components: [
					createAuthErrorContainer('Dein Kürzel entspricht nicht dem Muster!'),
				],
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
						'Abteilungsrolle konnte nicht hinzugefügt werden',
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
						'Klassenrollen konnte nicht hinzugefügt werden',
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
					createAuthErrorContainer('Spitzname konnte nicht gesetzt werden'),
				],
			}),
		);
		throw new Error('couldnt set nickname');
	}

	await tryCatch(message.edit({ components: [createAuthSuccessContainer()] }));
}
