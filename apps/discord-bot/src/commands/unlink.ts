import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { tryCatch } from 'common/src/tryCatch';
import { config } from 'common';
import { Command } from '../interfaces/Command';

const unlinkCommand: Command = {
	data: new SlashCommandBuilder()
		.setName('unlink')
		.setDescription(
			'Entfernt Rollen und Nickname, die durch Microsoft-Auth vergeben wurden.'
		),
	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		const guild = interaction.client.guilds.cache.get(config.GUILD_ID);
		if (!guild) {
			await interaction.reply({
				content: 'Guild nicht gefunden.',
				ephemeral: true,
			});
			return;
		}

		const memberResult = await tryCatch(
			guild.members.fetch(interaction.user.id)
		);
		if (memberResult.error) {
			await interaction.reply({
				content: 'Mitglied nicht gefunden.',
				ephemeral: true,
			});
			return;
		}
		const member = memberResult.data;

		const rolesToRemove = member.roles.cache.filter((role) => {
			return /^([A-Z][a-z]+|[a-z]{5}[abcdnmzy]\d{2})$/.test(role.name);
		});

		if (rolesToRemove.size === 0) {
			await interaction.reply({
				content: 'Keine verknüpften Rollen gefunden.',
				ephemeral: true,
			});
			return;
		}

		const removeResult = await tryCatch(member.roles.remove(rolesToRemove));
		if (removeResult.error) {
			console.error('Fehler beim Entfernen der Rollen:', removeResult.error);
			await interaction.reply({
				content: 'Fehler beim Entfernen der Rollen.',
				ephemeral: true,
			});
			return;
		}

		// Nickname zurücksetzen
		const nicknameResult = await tryCatch(member.setNickname(null));
		if (nicknameResult.error) {
			console.error(
				'Fehler beim Zurücksetzen des Nicknames:',
				nicknameResult.error
			);
			// nicht kritisch, wir fahren trotzdem fort
		}

		await interaction.reply({
			content:
				'Verknüpfung erfolgreich aufgehoben: Rollen entfernt und Nickname zurückgesetzt.',
			ephemeral: true,
		});
	},
};

export default unlinkCommand;
