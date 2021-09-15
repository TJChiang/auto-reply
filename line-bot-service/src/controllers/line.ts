import express, { Request, Response } from 'express';
import {
    Client,
    WebhookEvent,
} from '@line/bot-sdk';
import { QuickReplyItem } from '@line/bot-sdk/dist/types';
import _ from 'lodash';
import RedisConnection from "@/db/redis";
import lineConfig from "@/config/line";
import lineConstant from "@/constants";

const router = express.Router();

const lineClient = new Client(lineConfig);
const redisClient = new RedisConnection().connect();

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
    console.log(req.body.events);
    Promise
        .all(req.body.events.map(parseEvent))
        .then(result => {
            const param: any = result[0];
            handleLineQuickReply(param.replyToken, param.action);
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
                case "image":
                    return Promise.resolve();
                default:
                    return Promise.resolve();
            }
        case "postback":
            return lineClient.pushMessage(<string>event.source.userId, {
                type: "text",
                text: "好喔..."
            });
        default:
            return Promise.resolve();
    }
}

// 處理指令
function handleMessageEvent(replyToken: string, userId: string | undefined, originText: string): Promise<any> {
    const step = redisClient.hget(userId);
    const text = _.replace(originText, ' ', '');
    // 上傳rich menu圖片 (width: 800 - 2500px; height: more than 250px)
    if (text == lineConstant.SETTINGS.RICH_MENU.UPLOAD_IMAGE) {
        // 設定該 userId 的 step = 1
        redisClient.hset(userId, 1);
        return lineClient.replyMessage(replyToken, {
            type: "text",
            text: "請上傳圖片"
        });
    }
    
    if (_.includes(lineConstant.COMMAND.SETTINGS, text)) {
        return Promise.resolve({replyToken, action: lineConstant.SETTINGS.ACTIONS.SETTINGS_PARAMETERS});
    }

    return Promise.resolve();
}

// 處理line bot快速回覆
function handleLineQuickReply(replyToken: string, action: number): Promise<any> {
    return lineClient.replyMessage(replyToken, {
        type: "text",
        text: "請問需要什麼服務？",
        quickReply: {
            items: [
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "設定參數",
                        data: String(lineConstant.SETTINGS.ACTIONS.SETTINGS_PARAMETERS),
                        text: "設定參數"
                    }
                },
                {
                    type: "action",
                    action: {
                        type: "postback",
                        label: "沒事...",
                        data: String(lineConstant.SETTINGS.ACTIONS.NOTHING),
                        text: "沒事..."
                    }
                }
            ]
        }
    });
}

function quickReplyTemplate(type: string = "text", text: string = "設定中...", quickReply: Array<any>): Object | Object[] {
    return {type, text, quickReply};
}
// client.pushMessage(`${process.env.LINE_USER_ID}`, {
//     type: 'text',
//     text: 'hi'
// });

function handleRichMenu(): Promise<any> {
    const richMenu: any = {
        size: {
          width: 2500,
          height: 843
        },
        selected: false,
        name: "Option menu",
        chatBarText: "Tap to open",
        areas: [
          {
            bounds: {
              x: 0,
              y: 0,
              width: 833,
              height: 843
            },
            action: {
                type: "message",
                label: "聊天",
                data: String(lineConstant.SETTINGS.ACTIONS.NOTHING),
                text: "聊天"
            }
          },
          {
            bounds: {
              x: 0,
              y: 0,
              width: 833,
              height: 843
            },
            action: {
                type: "postback",
                label: "設定",
                data: String(lineConstant.SETTINGS.ACTIONS.NOTHING),
                text: "設定"
            }
          },
          {
            bounds: {
              x: 0,
              y: 0,
              width: 833,
              height: 843
            },
            action: {
                type: "postback",
                label: "沒事...",
                data: String(lineConstant.SETTINGS.ACTIONS.NOTHING),
                text: "沒事..."
            }
          }
        ]
    };
    return lineClient.createRichMenu(richMenu).then((richMenuId) => {
        return richMenuId;
    });
}

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