function getUserByEmail(email, database) {
  let user = Object.values(database).find((user) => user.email === email);
  console.log(user);
  if (user === undefined) {
    return undefined;
  } else {
    return user;
  }
}

function generateRamdomStrings() {
  const alphanumericData =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    const random = Math.floor(Math.random() * alphanumericData.length);
    result += alphanumericData[random];
  }
  return result;
}

function urlsForUser(id, database) {
  const userUrls = {};
  for (let urlId in database) {
    if (database[urlId].userId === id) {
      userUrls[urlId] = database[urlId].longURL;
    }
  }
  return userUrls;
}
//

module.exports = { getUserByEmail, generateRamdomStrings, urlsForUser };
