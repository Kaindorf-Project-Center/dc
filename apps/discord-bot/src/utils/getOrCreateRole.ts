import { GuildMember, Role } from 'discord.js';
import { tryCatch, Result } from 'common/src/tryCatch';

export async function getOrCreateRole(
  member: GuildMember,
  roleName: string
): Promise<Result<Role, Error>> {
  const existingRole = member.guild.roles.cache.find(
    (r) => r.name === roleName
  );
  if (existingRole) {
    return { data: existingRole, error: null };
  }
  const roleResult = await tryCatch(
    member.guild.roles.create({ name: roleName })
  );
  if (roleResult.error) {
    return { data: null, error: roleResult.error };
  }
  return { data: roleResult.data, error: null };
}
