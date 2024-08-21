import { Injectable } from '@nestjs/common';
import {
    TransactionResponse,
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';
import { HederaService } from 'src/hedera/hedera.service';
import { LoggerService } from 'src/logger/logger.service';

dotenv.config();

@Injectable()
export class TicTacToeService {
    constructor(private readonly hederaService: HederaService,
                private readonly logger: LoggerService) {}

    async createGame(player1Id: string): Promise<TransactionResponse> {
        const topicId = await this.hederaService.createTopic();
        await this.hederaService.subscribeToTopic(topicId, (gameState: any) => {
            this.doSomething(gameState);
        });

        const initialBoard = ['', '', '', '', '', '', '', '', ''];
        const gameData = {
            player1Id,
            player2Id: null,
            board: initialBoard,
            currentPlayer: player1Id,
            winner: null,
            status: 'waiting_for_player2',
            topicId: topicId.toString(),
        };

        await this.hederaService.sendTopicMessage(gameData, topicId.toString());

        return { topicId: topicId.toString(), gameData } as any;
    }

    doSomething(gameState: any) {
        this.logger.LogObject("Subscribed GameState", gameState);
    }

    async joinGame(topicId: string, player2Id: string): Promise<TransactionResponse> {
        const gameState = (await this.getGameStateHistory(topicId)).at(-1);

        if (gameState.status === 'waiting_for_player2') {
            gameState.player2Id = player2Id;
            gameState.status = 'in_progress';
            await this.hederaService.sendTopicMessage(gameState, topicId);
        }

        return gameState;
    }

    async makeMove(topicId: string, playerId: string, position: number): Promise<TransactionResponse> {
        const gameState = (await this.getGameStateHistory(topicId)).at(-1);

        if (gameState.currentPlayer !== playerId || gameState.board[position] !== '') {
            throw new Error('Invalid move');
        }

        gameState.board[position] = playerId === gameState.player1Id ? 'X' : 'O';
        const winner = this.checkWinner(gameState.board);
        if (winner) {
            gameState.winner = winner;
            gameState.status = 'completed';
        } else if (gameState.board.every((cell: any) => cell !== '')) {
            gameState.status = 'draw';
        } else {
            gameState.currentPlayer = playerId === gameState.player1Id ? gameState.player2Id : gameState.player1Id;
        }

        await this.hederaService.sendTopicMessage(gameState, topicId);

        return gameState;
    }

    async getGameStateHistory(topicId: string): Promise<any[]> {
        return await this.hederaService.getTopicMessages(topicId);
    }

    public checkWinner(board: string[]): string | null {
        const winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6]             // diagonals
        ];

        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a]; // Return 'X' or 'O' as the winner
            }
        }
        return null;
    }
}
