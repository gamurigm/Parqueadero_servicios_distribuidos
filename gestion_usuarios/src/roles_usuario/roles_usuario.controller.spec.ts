import { Test, TestingModule } from '@nestjs/testing';
import { RolesUsuarioController } from './roles_usuario.controller';
import { RolesUsuarioService } from './roles_usuario.service';

describe('RolesUsuarioController', () => {
  let controller: RolesUsuarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesUsuarioController],
      providers: [RolesUsuarioService],
    }).compile();

    controller = module.get<RolesUsuarioController>(RolesUsuarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
