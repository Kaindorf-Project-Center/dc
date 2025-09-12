export interface UserData {
	id: string;
	displayName: string;
	userPrincipalName: string;
	surname: string;
	givenName: string;
	mail: string | null;
	jobTitle: string | null;
	[key: ExtensionPropertyKey]: string | null;
}

export type ExtensionPropertyKey = `extension_${string}_discordId`;
