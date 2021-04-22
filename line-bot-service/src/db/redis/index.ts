import Redis from "redis";

export default class RedisDatabase {
    redis: any;

    constructor() {
        this.redis = Redis;
    }

    connect() {
        const client = this.redis.createClient({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT
        });

        client.on("error", (err: string) => console.log(err));
        client.on("ready", (err: string) => console.log("Redis Ready"));

        return client;
    }
}