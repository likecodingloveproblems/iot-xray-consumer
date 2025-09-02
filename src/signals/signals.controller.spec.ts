import { Test, TestingModule } from '@nestjs/testing';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { NotFoundException } from '@nestjs/common';
import { CreateSignalDto } from './signals.dto';
import { Signal } from './schemas/signal';

describe('SignalsController', () => {
  let controller: SignalsController;
  let service: jest.Mocked<SignalsService>;

  const mockSignal: Signal = {
    _id: '123',
    deviceId: 'device1',
    time: 123456789,
    data: { time: 123, x: 1.22, y: 2.33, speed: 12112.000000012 },
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignalsController],
      providers: [
        {
          provide: SignalsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SignalsController>(SignalsController);
    service = module.get(SignalsService);
  });

  describe('create', () => {
    it('should create a signal', async () => {
      const dto = new CreateSignalDto();
      dto.toSchema = jest.fn().mockReturnValue(mockSignal);
      service.create.mockResolvedValue(mockSignal);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(mockSignal);
      expect(result).toEqual(mockSignal);
    });
  });

  describe('findAll', () => {
    it('should return all signals', async () => {
      service.findAll.mockResolvedValue([mockSignal]);

      const result = await controller.findAll(0, 50);

      expect(service.findAll).toHaveBeenCalledWith(0, 50);
      expect(result).toEqual([mockSignal]);
    });
  });

  describe('findOne', () => {
    it('should return a signal if found', async () => {
      service.findOne.mockResolvedValue(mockSignal);

      const result = await controller.findOne('123');

      expect(service.findOne).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockSignal);
    });

    it('should throw NotFoundException if not found', async () => {
      service.findOne.mockResolvedValue(null);

      await expect(controller.findOne('999')).rejects.toThrow(
        new NotFoundException('Signal not found'),
      );
    });
  });

  describe('update', () => {
    it('should update and return the signal', async () => {
      service.update.mockResolvedValue(mockSignal);

      const result = await controller.update('123', { name: 'Updated' });

      expect(service.update).toHaveBeenCalledWith('123', { name: 'Updated' });
      expect(result).toEqual(mockSignal);
    });

    it('should throw NotFoundException if not found', async () => {
      service.update.mockResolvedValue(null);

      await expect(
        controller.update('999', { name: 'Updated' }),
      ).rejects.toThrow(new NotFoundException('Signal not found'));
    });
  });

  describe('remove', () => {
    it('should remove a signal successfully', async () => {
      service.remove.mockResolvedValue(true);

      await controller.remove('123');

      expect(service.remove).toHaveBeenCalledWith('123');
    });

    it('should throw NotFoundException if not found', async () => {
      service.remove.mockResolvedValue(false);

      await expect(controller.remove('999')).rejects.toThrow(
        new NotFoundException('Signal not found'),
      );
    });
  });
});
