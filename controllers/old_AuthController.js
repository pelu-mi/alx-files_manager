import { v4 as uuidv4 } from 'uuid';

const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');
const { hashPassword } = require('../utils/utils');

class AuthController {
  static async getConnect(req, res) {
    // Check if header is available
    const authToken = req.header('Authorization') || null;
    if (!authToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // Decode auth token from base64 to utf8 to get string containing email and pwd
    const authTokenDecoded = Buffer.from(authToken.split(' ')[1], 'base64').toString('utf-8');
    const [email, password] = authTokenDecoded.split(':');
    if (!email || !password) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // Check if user exists
    const hashPwd = hashPassword(password);
    const user = await (await dbClient.usersCollection()).findOne({ email, password: hashPwd });
    if (user) {
      // Create new token
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);
      res.status(200).send({ token });
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }

  static async getDisconnect(req, res) {
    let authToken = req.header('X-Token') || null;
    if (!authToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
    authToken = `auth_${authToken}`;
    const user = redisClient.get(authToken);
    if (user) {
      await redisClient.del(authToken);
      res.status(204).send();
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
