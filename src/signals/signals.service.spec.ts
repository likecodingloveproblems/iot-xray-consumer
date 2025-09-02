import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { SignalsService } from './signals.service';
import { Signal, SignalSchema } from './schemas/signal';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';
import { getConnectionToken } from '@nestjs/mongoose';

describe('SignalsService (integration)', () => {
  let service: SignalsService;
  let mongoServer: MongoMemoryServer;
  let connection: Connection;

  // Mock RabbitMQ service so we don’t connect to a real broker
  const mockRabbit = {
    registerSignalConsumer: jest.fn(),
  };

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Signal.name, schema: SignalSchema },
        ]),
      ],
      providers: [
        SignalsService,
        { provide: RabbitMQService, useValue: mockRabbit },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
    connection = await module.get(getConnectionToken());
  });

  beforeEach(async () => {
    // Clear collection before each test
    await connection.db.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
    await mongoServer.stop();
  });

  it('should create a signal', async () => {
    const created = await service.create({
      deviceId: 'dev-1',
      timestamp: 123,
      data: [[1, [1, 2, 3]]],
      dataLength: 1,
      dataVolume: 20,
    });

    expect(created).toMatchObject({
      deviceId: 'dev-1',
      timestamp: 123,
      dataLength: 1,
    });

    const found = await service.findAll();
    expect(found.length).toBe(1);
    expect(found[0].deviceId).toBe('dev-1');
  });

  it('should find one by id', async () => {
    const created = await service.create({
      deviceId: 'dev-2',
      timestamp: 456,
      data: [[2, [3, 4, 5]]],
      dataLength: 1,
      dataVolume: 20,
    });

    const found = await service.findOne(created._id.toString());
    expect(found?.deviceId).toBe('dev-2');
  });

  it('should update a signal', async () => {
    const created = await service.create({
      deviceId: 'dev-3',
      timestamp: 789,
      data: [],
      dataLength: 0,
      dataVolume: 0,
    });

    const updated = await service.update(created._id.toString(), {
      deviceId: 'updated-dev',
    });

    expect(updated?.deviceId).toBe('updated-dev');
  });

  it('should remove a signal', async () => {
    const created: Signal = await service.create({
      deviceId: 'dev-4',
      timestamp: 999,
      data: [],
      dataLength: 0,
      dataVolume: 0,
    });

    const result = await service.remove(created._id.toString());
    expect(result).toBe(true);

    const found = await service.findOne(created._id.toString());
    expect(found).toBeNull();
  });

  it('should process incoming signal from RabbitMQ', async () => {
    const payload = {
      'dev-5': {
        time: 1000,
        data: [[1, [7, 8, 9]]],
      },
    };
    const msg = {
      content: { toString: () => JSON.stringify(payload) },
    };

    // @ts-expect-error – private method is tested indirectly
    await service['processIncomingSignal'](msg);

    const found = await service.findAll();
    expect(found.length).toBe(1);
    expect(found[0].deviceId).toBe('dev-5');
    expect(found[0].dataLength).toBe(1);
  });
});
