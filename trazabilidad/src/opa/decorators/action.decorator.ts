import { SetMetadata } from '@nestjs/common';

export const ACTION_KEY = 'opa_action';
export const Action = (action: string) => SetMetadata(ACTION_KEY, action);
