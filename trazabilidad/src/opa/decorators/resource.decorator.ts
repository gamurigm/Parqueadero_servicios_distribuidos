import { SetMetadata } from '@nestjs/common';

export const RESOURCE_KEY = 'opa_resource';
export const Resource = (resource: string) => SetMetadata(RESOURCE_KEY, resource);
