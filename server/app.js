const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");

dotenv.config();

app.use(
  cors({
    origin: "*", // Frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const connectToDb = require("./db/db");
connectToDb();

// Auth0 middleware
const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE, // 'https://api.satark.ai'
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`, // 'https://dev-f4m3uc5x1b5yzdyc.us.auth0.com/'
  tokenSigningAlg: "RS256",
});

const userRoutes = require("./routes/user.routes");
const legalRoutes = require("./routes/legal.routes");

// Public routes
app.get("/", (req, res) => {
  res.send("Hello World");
});
app.use("/users", userRoutes);

// Protected routes
app.use("/legal", jwtCheck, legalRoutes);

// Test endpoint from your example
app.get("/authorized", jwtCheck, (req, res) => {
  res.send("Secured Resource");
});


module.exports = app;