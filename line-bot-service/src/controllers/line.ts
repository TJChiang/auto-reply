import express, { Request, Response } from 'express';
import {
    Client,
    WebhookEvent,
} from '@line/bot-sdk';
import { QuickReplyItem } from '@line/bot-sdk/dist/types';
import _ from 'lodash';
import lineConfig from '../config/line';
import LINECONSTANT from '../utils';

const router = express.Router();

router.post('/webhook', lineReplyHook);

function lineReplyHook(req: Request, res: Response) {
    // req.body.events.map((ev: WebhookEvent) => {
    //     console.log(ev);
    // });
    // Promise
    //     .all(req.body.events.map(parseEvent))
    //     .then(result => res.json(result))
    //     .catch(err => {
    //         console.error(err);
    //         res.status(500).end();
    //     });
    // const client = new Client(lineConfig);
    // const event = req.body.events[0];
    // console.log(event);
    // return client.replyMessage(event.replyToken, {
    //     type: "text",
    //     text: "Quick Reply",
    //     quickReply: {
    //         items: [
    //             {
    //                 type: "action",
    //                 action: {
    //                     type: "postback",
    //                     label: "01",
    //                     data: "A",
    //                     text: "postback01"
    //                 }
    //             }, 
    //             {
    //                 type: "action",
    //                 action: {
    //                     type: "message",
    //                     label: "02",
    //                     text: "postback02"
    //                 }
    //             }
    //         ]
    //     }
    // });
    Promise
        .all(req.body.events.map(parseEvent))
        .then(result => {
            // Note: 型別錯誤 -> result 是 Arrayn<unknown> 暫時多宣告 res 以轉接回傳值
            const res: any = result[0];
            handleLineQuickReply(res.quickReplyItem, res.replyToken);
        })
        .catch(err => {
            console.error(err);
            res.status(500).end();
        });
};

// 解析 Request 中的 WebhookEvent Type
function parseEvent(event: WebhookEvent): Promise<any> {
    switch (event.type) {
        case "message":
            const message = event.message;
            switch (message.type) {
                case "text":
                    return handleMessageEvent(event.replyToken, event.source.userId, message.text);
                default:
                    return Promise.resolve();
            }
        default:
            return Promise.resolve();
    }
}

// 處理指令
function handleMessageEvent(replyToken: string, userId: string | undefined, originText: string): Promise<any> {
    const text = _.replace(originText, ' ', '');
    switch(text) {
        case "設定":
        case "Settings":
            const quickReplyItem: Object[] = [
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "+1 @123",
                        data: "A",
                        text: "+1 @123"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "+2 @123 @456",
                        data: "A",
                        text: "+2 @123 @456"
                    }
                }
            ];
            return Promise.resolve({quickReplyItem, replyToken});
        default:
            return Promise.resolve();
    }
}

// 處理line bot快速回覆
function handleLineQuickReply(quickReplyItem: QuickReplyItem[], replyToken: string): Promise<any> {
    const client = new Client(lineConfig);
    return client.replyMessage(replyToken, {
        type: "text",
        text: "Quick Reply",
        quickReply: {
            items: quickReplyItem
        }
    });
}

// const client = new lineClient(lineConfig);
// client.pushMessage(`${process.env.LINE_USER_ID}`, {
//     type: 'text',
//     text: 'hi'
// });

export default router;

// {
//     "events": [
//         {
//             "type": "message",
//             "replyToken": "a5f6317a1e5e44348138959d53abe09b",
//             "source": {
//                 "userId": "U01c78330d5108aa8850c26133f9a00dc",
//                 "type": "user"
//             },
//             "timestamp": 1617454743010,
//             "mode": "active",
//             "message": {
//                 "type": "text",
//                 "id": "13829519122035",
//                 "text": "hi"
//             }
//         }
//     ],
//     "destination": "Uaeac3c9ad06eab2003a491210914670d"
// }