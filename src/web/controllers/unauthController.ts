import { Request, Response } from 'express';
import { msalClient } from '../../server';
import { setUserDiscordId } from '../helpers/setUserDiscordId';
import { getAppToken } from '../helpers/tokens';

export const unauthenticate = async (req: Request, res: Response) => {};
