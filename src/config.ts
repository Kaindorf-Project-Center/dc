import { z } from 'zod';

const ConfigSchema = z.object({
  DISCORD_TOKEN: z.string().nonempty('DISCORD_TOKEN is required'),
  MICROSOFT_CLIENT_ID: z.string().nonempty('MICROSOFT_CLIENT_ID is required'),
  MICROSOFT_CLIENT_SECRET: z
    .string()
    .nonempty('MICROSOFT_CLIENT_SECRET is required'),
  MICROSOFT_OBJECT_ID: z.string().nonempty('MICROSOFT_OBJECT_ID is required'),
  MICROSOFT_REDIRECT_URI: z
    .string()
    .url('MICROSOFT_REDIRECT_URI must be a valid URL'),
  MICROSOFT_TENANT_ID: z.string().nonempty('MICROSOFT_TENANT_ID is required'),
  BACKEND_BASE_URL: z.string().nonempty('DISCORD_BASE_URL is required'),
  CLIENT_ID: z.string().nonempty('CLIENT_ID is required'),
  GUILD_ID: z.string().nonempty('GUILD_ID is required'),
});

export const config = ConfigSchema.parse(process.env);
