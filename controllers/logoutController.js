const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const fsPromises = require("fs").promises;
const path = require("path");
const jwt = require("jsonwebtoken");
const { stringify } = require("querystring");
require("dotenv").config();

const handleLogOut = async (req, res) => {
  //On client, also delete the accessToken
  const cookie = req.cookie;
  if (!cookie?.jwt) return res.status(204); //No content

  const refreshToken = cookie.jwt;

  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );
  if (!foundUser) {
    res.clearCookie("jwt", { httpOnly: true }, { maxAge: 24 * 60 * 60 * 1000 });
    return res.sendStatus(204);
  }
  //Delete refreshToken in db
  const otherUsers = usersDB.users.filter(
    (person) => person.refreshToken !== foundUser.refreshToken
  );
  const currentUser = { ...foundUser, refreshToken: "" };
  usersDB.setUsers([...otherUsers, currentUser]);
  await fsPromises.writeFile(
    path.join(__dirname, "..", "users.json"),
    JSON.stringify(usersDB.users)
  );
  res.clearCookie('jwt', {httpOnly: true})
};
module.exports = { handleLogOut };
