const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  /* Redis Client class */
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => console.log(err));
    this.connected = false;
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    const setAsync = promisify(this.client.set).bind(this.client);
    await setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    const delAsync = promisify(this.client.del).bind(this.client);
    await delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
