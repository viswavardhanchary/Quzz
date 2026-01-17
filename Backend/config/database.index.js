const [Users] =  require('../models/user');

async function createUserIndex() {
  const response = await Users.collection.createIndex({email: 1} , {unique: true});
}


module.exports = [createUserIndex];

