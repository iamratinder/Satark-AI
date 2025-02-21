const userModel = require("../models/user.model");
const blackListTokenModel = require("../models/blacklistToken.model");

module.exports.getUserProfile = async (req, res, next) => {
  try {
    const auth0User = req.auth.payload; // From Auth0 middleware
    const user = await userModel.findOne({ email: auth0User.email });

    if (!user) {
      const newUser = await userModel.create({
        fullname: {
          firstname: auth0User.given_name || "Unknown",
          lastname: auth0User.family_name || "",
        },
        email: auth0User.email,
      });
      return res.status(200).json(newUser);
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to get profile", error: error.message });
  }
};

module.exports.logoutUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await blackListTokenModel.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};