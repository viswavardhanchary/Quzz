const { createClient } = require('redis');
require('dotenv').config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Successfully connected to Redis Container!'));

(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to establish initial Redis connection:', err);
    }
})();

module.exports = [redisClient];