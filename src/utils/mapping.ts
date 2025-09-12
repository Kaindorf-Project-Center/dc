import { promises as fsPromises } from 'fs';
import YAML from 'yaml';
import type { Result } from './tryCatch';
import { tryCatch } from './tryCatch';

export interface DepartmentDetails {
	department: string;
	longname: string;
}

const ROLE_MAPPING_FILEPATH = './shorthand-role-mapping.yaml';

/** Laufzeit-Validierung für DepartmentDetails */
function isDepartmentDetails(value: unknown): value is DepartmentDetails {
	if (typeof value !== 'object' || value === null) return false;
	const rec = value as Record<string, unknown>;
	return typeof rec.department === 'string' && typeof rec.longname === 'string';
}

/** Laufzeit-Validierung für das gesamte Mapping */
function isDepartmentMapping(
	value: unknown,
): value is Record<string, DepartmentDetails> {
	if (typeof value !== 'object' || value === null) return false;
	const obj = value as Record<string, unknown>;
	return Object.values(obj).every(isDepartmentDetails);
}

export async function getMappingForLetter(
	letter: string,
): Promise<Result<DepartmentDetails, Error>> {
	const fileResult = await tryCatch(
		fsPromises.readFile(ROLE_MAPPING_FILEPATH, 'utf8'),
	);
	if (fileResult.error) {
		return { data: null, error: fileResult.error };
	}

	try {
		const raw: unknown = YAML.parse(fileResult.data);

		if (!isDepartmentMapping(raw)) {
			return { data: null, error: new Error('Ungültiges Mapping-Format') };
		}

		// jetzt: Record<string, DepartmentDetails>
		const mapping = raw;
		const entry = mapping[letter];

		if (entry) {
			return { data: entry, error: null };
		}
		return { data: null, error: new Error('Mapping not found for letter') };
	} catch (err) {
		return { data: null, error: err as Error };
	}
}

export function getAllDepartments(
	departmentMap: Map<string, DepartmentDetails>,
): Result<string[], Error> {
	const departments = Array.from(departmentMap.values()).map(
		(entry) => entry.department,
	);
	const uniqueDepartments = Array.from(new Set(departments));
	return { data: uniqueDepartments, error: null };
}

export function getAllPostfixes(
	departmentMap: Map<string, DepartmentDetails>,
): Result<string[], Error> {
	const longnames = Array.from(departmentMap.values()).map(
		(entry) => entry.longname,
	);
	return { data: longnames, error: null };
}

export async function parseYamlToMap(): Promise<
	Result<Map<string, DepartmentDetails>, Error>
	> {
	const fileResult = await tryCatch(
		fsPromises.readFile(ROLE_MAPPING_FILEPATH, 'utf8'),
	);

	if (fileResult.error) {
		return { data: null, error: fileResult.error };
	}

	try {
		const raw: unknown = YAML.parse(fileResult.data);

		if (!isDepartmentMapping(raw)) {
			return { data: null, error: new Error('Ungültiges Mapping-Format') };
		}

		// Record<string, DepartmentDetails>
		const parsedData = raw;
		const resultMap = new Map<string, DepartmentDetails>();

		for (const [key, value] of Object.entries(parsedData)) {
			resultMap.set(key, value);
		}

		return { data: resultMap, error: null };
	} catch (err) {
		return { data: null, error: err as Error };
	}
}
