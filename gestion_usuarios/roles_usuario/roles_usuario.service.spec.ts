import { Test, TestingModule } from '@nestjs/testing';
import { RolesUsuarioService } from './roles_usuario.service';

describe('RolesUsuarioService', () => {
  let service: RolesUsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesUsuarioService],
    }).compile();

    service = module.get<RolesUsuarioService>(RolesUsuarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
