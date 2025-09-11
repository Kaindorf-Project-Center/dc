import type { ExtensionProperty } from '@microsoft/microsoft-graph-types';
import { config } from '../../config';
// TODO: error handling
export async function createExtensionAttributeIfNotExists(accessToken: string) {
	try {
		console.log('Checking if extension attribute \'discordId\' exists...');

		// Step 1: Check existing attributes
		const checkResponse = await fetch(
			`https://graph.microsoft.com/v1.0/applications/${config.MICROSOFT_OBJECT_ID}/extensionProperties`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
			},
		);

		const checkData = await checkResponse.json();

		const existingAttribute = checkData.value?.find((attr: ExtensionProperty) =>
			attr.name?.includes('discordId'),
		);

		if (existingAttribute) {
			console.log('Extension attribute \'discordId\' already exists.');
			return existingAttribute; // Skip creation
		}

		// Step 3: Create the attribute if not found
		console.log('Creating new extension attribute \'discordId\'...');

		const createResponse = await fetch(
			`https://graph.microsoft.com/v1.0/applications/${config.MICROSOFT_OBJECT_ID}/extensionProperties`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'discordId',
					dataType: 'String',
					targetObjects: ['User'],
				}),
			},
		);

		const createData = await createResponse.json();
		console.log('Created Extension Attribute:', createData);
		return createData;
	}
	catch (error) {
		throw new Error('Failed to find or create Extension Attribute.');
	}
}
