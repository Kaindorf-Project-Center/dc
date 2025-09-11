import type { GuildMember, Message } from 'discord.js';
import { tryCatch } from '../../utils/tryCatch';
import { getMappingForLetter } from '../../utils/mapping';
import { getOrCreateRole } from '../../utils/getOrCreateRole';
import {
	createErrorContainer,
	createSuccessContainer,
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
					createErrorContainer('Dein Kürzel entspricht nicht dem Muster!'),
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
	await tryCatch(member.roles.add(deptRole));
	await tryCatch(member.roles.add(classRole));
	await tryCatch(member.setNickname(`${user.givenName} ${user.surname}`));

	await tryCatch(message.edit({ components: [createSuccessContainer()] }));
}
