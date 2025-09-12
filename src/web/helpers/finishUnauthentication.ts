import type { GuildMember, Message } from 'discord.js';
import { tryCatch } from '../../utils/tryCatch';
import { getMappingForLetter } from '../../utils/mapping';
import { getOrCreateRole } from '../../utils/getOrCreateRole';
import {
	createUnauthErrorContainer,
	createUnauthSuccessContainer,
} from 'src/utils/unauthComponents';
import type { TFunction } from 'src/i18n/i18n';

export async function finishUnauthentication(
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
				components: [
					createUnauthErrorContainer(
						t, t('verify.wrongAbbr'),
					),
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
	await tryCatch(member.roles.remove(deptRole));
	await tryCatch(member.roles.remove(classRole));
	await tryCatch(member.setNickname(''));

	await tryCatch(
		message.edit({ components: [createUnauthSuccessContainer(t)] }),
	);
}
