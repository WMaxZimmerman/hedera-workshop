import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicTacToeController } from './tictactoe/tictactoe.controller';
import { TicTacToeService } from './tictactoe/tictactoe.service';
import { LoggerService } from './logger/logger.service';
import { HederaService } from './hedera/hedera.service';

@Module({
    imports: [],
    controllers: [AppController, TicTacToeController],
    providers: [AppService, TicTacToeService, HederaService, LoggerService],
})
export class AppModule {}
