import { Test, TestingModule } from '@nestjs/testing';
import { RolesPersonaController } from './roles_persona.controller';
import { RolesPersonaService } from './roles_persona.service';

describe('RolesPersonaController', () => {
  let controller: RolesPersonaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesPersonaController],
      providers: [RolesPersonaService],
    }).compile();

    controller = module.get<RolesPersonaController>(RolesPersonaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
