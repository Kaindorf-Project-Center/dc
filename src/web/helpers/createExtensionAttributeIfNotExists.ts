import type { ExtensionProperty } from '@microsoft/microsoft-graph-types';
import { config } from '../../config';
import { graphClientWithToken } from './graph';
import type { ExtensionPropertiesResponse } from '../interfaces/ExtensionPropertiesResponse';

// TODO: error handling
export async function createExtensionAttributeIfNotExists(accessToken: string) {
	try {
		console.log("Checking if extension attribute 'discordId' exists...");

		const graph = graphClientWithToken(accessToken);

		// Check existing attributes
		const checkResponse = (await graph
			.api(`/applications/${config.MICROSOFT_OBJECT_ID}/extensionProperties`)
			.get()
			.catch((r) => {
				console.error(r);
			})) as ExtensionPropertiesResponse;

		const existingAttribute = checkResponse.value.find(
			(attr: ExtensionProperty) => attr.name?.includes('discordId')
		);

		if (existingAttribute) {
			console.log("Extension attribute 'discordId' already exists.");
			// Skip creation
			return existingAttribute;
		}

		// Create the attribute if not found
		console.log("Creating new extension attribute 'discordId'...");

		const extensionProperty = {
			name: 'discordId',
			dataType: 'String',
			targetObjects: ['User'],
		};

		const createResponse = (await graph
			.api(`/applications/${config.MICROSOFT_OBJECT_ID}/extensionProperties`)
			.post(extensionProperty)) as ExtensionProperty;

		console.log(createResponse);

		// code to delete an extension attribute if matze makes faxen
		// const deleteResponse = await graph
		// 	.api(`/applications/${config.MICROSOFT_OBJECT_ID}/extensionProperties/${createResponse.id}`)
		// 	.delete().catch(r => {console.log(r);});

		console.log('Created Extension Attribute:', createResponse);
		return createResponse;
	} catch (e) {
		console.error(e);
		throw new Error('Failed to find or create Extension Attribute.');
	}
}
