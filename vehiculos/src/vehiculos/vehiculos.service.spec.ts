import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { VehiculosService } from './vehiculos.service';
import { EventPublisher } from './event-publisher.service';
import { Vehiculo } from './entities/vehiculo.entity';

describe('VehiculosService', () => {
  let service: VehiculosService;
  const vehiculoRepositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
  };
  const eventPublisherMock = {
    publish: jest.fn(),
  };
  const configServiceMock = {
    get: jest.fn((_key: string, fallback?: string) => fallback),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    eventPublisherMock.publish.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiculosService,
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: vehiculoRepositoryMock,
        },
        {
          provide: EventPublisher,
          useValue: eventPublisherMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<VehiculosService>(VehiculosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates autos with the TypeORM discriminator value', async () => {
    vehiculoRepositoryMock.findOne.mockResolvedValue(null);
    vehiculoRepositoryMock.save.mockImplementation(async (vehiculo) => ({
      id: 'a8174fd0-5579-4edf-9ba1-42be11b259b7',
      ...vehiculo,
    }));

    const result = await service.create({
      tipo: 'auto',
      datos: {
        placa: 'ABC-1234',
        marca: 'Toyota',
        modelo: 'Corolla',
        color: 'Blanco',
        anio: 2026,
        clasificacion: 'Gasolina',
        numeroPuertas: 4,
        capacidadMaletero: 450,
      },
    });

    expect(vehiculoRepositoryMock.save).toHaveBeenCalledWith(
      expect.objectContaining({
        tipo: 'auto',
        placa: 'abc-1234',
        marca: 'toyota',
        modelo: 'Corolla',
        color: 'blanco',
        anio: 2026,
        clasificacion: 'Gasolina',
        numeroPuertas: 4,
        capacidadMaletero: 450,
      }),
    );
    expect(result).toEqual(expect.objectContaining({ tipo: 'auto' }));
  });
});