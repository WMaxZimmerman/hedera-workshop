import { Test, TestingModule } from '@nestjs/testing';
import { TictactoeController } from './tictactoe.controller';

describe('TictactoeController', () => {
  let controller: TictactoeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TictactoeController],
    }).compile();

    controller = module.get<TictactoeController>(TictactoeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
