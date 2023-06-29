const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      res.end();
      return;
    }

    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      res.end();
      return;
    }

    const userExists = await dbClient.userExists(email);
    if (userExists) {
      res.status(400).json({ error: 'Already exist' });
      res.end();
      return;
    }

    const user = await dbClient.createUser(email, password);
    const id = `${user.insertedId}`;
    res.status(201).json({ id, email });
    res.end();
  }

  static async getMe(req, res) {
    const authToken = req.header('X-Token') || null;
    if (!authToken) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
    const token = `auth_${authToken}`;
    const user = redisClient.get(token);
    if (!user) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }
    const userDoc = await (await dbClient.usersCollection()).findOne({ _id: ObjectId(user) });
    if (userDoc) {
      res.status(200).send({ id: user, email: userDoc.email });
    } else {
      res.status(401).send({ error: 'Unauthorized' });
    }
  }
}

module.exports = UsersController;
