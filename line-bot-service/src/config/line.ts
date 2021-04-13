import dotenv from 'dotenv';

const {parsed: config} = dotenv.config({ path: '.env' });

export default {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || config!.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: `${process.env.LINE_CHANNEL_SECRET}` || config!.LINE_CHANNEL_SECRET
};