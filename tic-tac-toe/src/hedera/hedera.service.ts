import {
    AccountId,
    Client,
    PrivateKey,
    TopicCreateTransaction,
    TopicId,
    TopicMessageQuery,
    TopicMessageSubmitTransaction,
    TransactionResponse
} from '@hashgraph/sdk';
import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/logger/logger.service';


@Injectable()
export class HederaService {
    private client: Client;

    constructor(private readonly logger: LoggerService) {
        const accountId = process.env.HEDERA_ACCOUNT_ID;
        const privateKey = process.env.HEDERA_PRIVATE_KEY;
        const network = process.env.HEDERA_NETWORK || 'testnet';

        if (!accountId || !privateKey) {
            throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY must be set');
        }

        this.client = Client.forName(network);
        this.client.setOperator(
            AccountId.fromString(accountId),
            PrivateKey.fromString(privateKey)
        );
    }

    async createTopic(): Promise<TopicId> {
        const transaction = await new TopicCreateTransaction().execute(this.client);
        const receipt = await transaction.getReceipt(this.client);
        return receipt.topicId;
    }

    async getTopicMessages(topicId: string): Promise<any> {
        return await fetch(`https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`)
            .then(res => res.json())
            .then(res => {
                return res.messages.map((m: any) => {
                    const msg = m.message;
                    const json = Buffer.from(msg, 'base64').toString('binary');
                    const obj = JSON.parse(json);

                    return obj;
                });
            });
    }

    async sendTopicMessage(content: any, topicId: string): Promise<TransactionResponse> {
        const message = JSON.stringify(content);

        // Submit the message to the Hedera topic
        const submitMessageTx = new TopicMessageSubmitTransaction({
            topicId,
            message,
        });

        return await submitMessageTx.execute(this.client);
    }

    async subscribeToTopic(topicId: TopicId, callback: (obj: any) => void): Promise<void> {
        new TopicMessageQuery()
            .setTopicId(topicId)
            .subscribe(this.client, null, (message) => {
                const content = message.contents.toString();
                const obj = JSON.parse(content);
                this.logger.LogObject("Subscribed Callback", obj);
                callback(obj);
            });
    }
}


