import { Test, TestingModule } from '@nestjs/testing';
import { RolesPersonaService } from './roles_persona.service';

describe('RolesPersonaService', () => {
  let service: RolesPersonaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesPersonaService],
    }).compile();

    service = module.get<RolesPersonaService>(RolesPersonaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
