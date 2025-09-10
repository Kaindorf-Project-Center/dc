import { promises as fsPromises } from 'fs';
import YAML from 'yaml';
import { Result, tryCatch } from './tryCatch';

export interface DepartmentDetails {
  department: string;
  longname: string;
}

export async function getMappingForLetter(
  letter: string
): Promise<Result<DepartmentDetails, Error>> {
  const fileResult = await tryCatch(
    fsPromises.readFile('./shorthand-role-mapping.yaml', 'utf8')
  );
  if (fileResult.error) {
    return { data: null, error: fileResult.error };
  }
  try {
    const mapping = YAML.parse(fileResult.data);
    if (mapping && mapping[letter]) {
      return { data: mapping[letter], error: null };
    } else {
      return { data: null, error: new Error('Mapping not found for letter') };
    }
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export async function getAllDepartments(
  departmentMap: Map<string, DepartmentDetails>
): Promise<Result<string[], Error>> {
  const departments = Array.from(departmentMap.values()).map(
    (entry) => entry.department
  );

  const uniqueDepartments = Array.from(new Set(departments));

  return { data: uniqueDepartments, error: null };
}

export async function getAllPostfixes(
  departmentMap: Map<string, DepartmentDetails>
): Promise<Result<string[], Error>> {
  const longnames = Array.from(departmentMap.values()).map(
    (entry) => entry.longname
  );

  return { data: longnames, error: null };
}

export async function parseYamlToMap(): Promise<
  Result<Map<string, DepartmentDetails>, Error>
> {
  const fileResult = await tryCatch(
    fsPromises.readFile(
      './apps/discord-bot/shorthand-role-mapping.yaml',
      'utf8'
    )
  );

  if (fileResult.error) {
    return { data: null, error: fileResult.error };
  }

  const parsedData: Record<string, DepartmentDetails> = YAML.parse(
    fileResult.data
  );

  const resultMap = new Map<string, DepartmentDetails>();

  Object.entries(parsedData).forEach(([key, value]) => {
    resultMap.set(key, value);
  });

  return { data: resultMap, error: null };
}
