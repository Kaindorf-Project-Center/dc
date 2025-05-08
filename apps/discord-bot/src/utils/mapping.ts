import { promises as fsPromises } from 'fs';
import YAML from 'yaml';
import { tryCatch, Result } from 'common/src/tryCatch';

export interface Mapping {
  department: string;
  longname: string;
}

export async function getMappingForLetter(
  letter: string
): Promise<Result<Mapping, Error>> {
  const fileResult = await tryCatch(
    fsPromises.readFile(
      './apps/discord-bot/shorthand-role-mapping.yaml',
      'utf8'
    )
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
