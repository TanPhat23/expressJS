const usersDB = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const jwt = require("jsonwebtoken");
require("dotenv").config();

const handleRefreshToken = (req, res) => {
  const cookie = req.cookie;
  if (!cookie?.jwt) return res.sendStatus(401);
  console.log(cookie.jwt);
  const refreshToken = cookie.jwt;
  const foundUser = usersDB.users.find(
    (person) => person.refreshToken === refreshToken
  );
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const accessToken = jwt.sign(
      { username: decoded },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "30" }
    );
    res.json({ accessToken });
  });
};
module.exports = { handleRefreshToken };
