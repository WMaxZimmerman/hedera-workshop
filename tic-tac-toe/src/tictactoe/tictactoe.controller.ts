import { Controller, Post, Body } from '@nestjs/common';
import { TicTacToeService } from './tictactoe.service';
import { LoggerService } from 'src/logger/logger.service';

@Controller('tictactoe')
export class TicTacToeController {
    constructor(private readonly ticTacToeService: TicTacToeService,
                private readonly logger: LoggerService) {}

    @Post('create-game')
    async createGame(@Body('player1Id') player1Id: string) {
        this.logger.LogObject('Create Game Call', {player1Id});
        return this.ticTacToeService.createGame(player1Id);
    }

    @Post('join-game')
    async joinGame(@Body('topicId') topicId: string, @Body('player2Id') player2Id: string) {
        this.logger.LogObject("Join Game Call", {topicId, player2Id});
        return this.ticTacToeService.joinGame(topicId, player2Id);
    }

    @Post('make-move')
    async makeMove(@Body('topicId') topicId: string, @Body('playerId') playerId: string, @Body('position') position: number) {
        this.logger.LogObject("Make Move Call", {topicId, playerId, position});
        return this.ticTacToeService.makeMove(topicId, playerId, position);
    }

    @Post('get-game')
    async getGame(@Body('topicId') topicId: string) {
        this.logger.LogObject("Get Game Call", {topicId});
        return this.ticTacToeService.getGameStateHistory(topicId);
    }
}
