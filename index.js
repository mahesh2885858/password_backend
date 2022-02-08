import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import session from "express-session";
import userRouter from "./Routes/Users.js";
import addItemRouter from "./Routes/addItem.js";
import MongoDBStore from "connect-mongodb-session";
const mongodbStore = MongoDBStore(session);
dotenv.config();
const app = express();
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
// to store the sessionid in our database
const store = new mongodbStore({
  uri: process.env.CONNECT_URL,
  collection: "mySessions",
});

app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    store,
    cookie: {
      expires: 1000 * 60 * 60 * 2,//user will logged out in two hours
    },
  })
);
app.use("/", userRouter);
app.use("/user", addItemRouter);

const port = process.env.PORT || 4000;
const db = mongoose
  .connect(process.env.CONNECT_URL, {
    useNewUrlParser: true,

    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connection was successfull");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log("the port is running on " + port);
});
