import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mediaR from "./services/media/media.js";
import { genericErrHandl, regErrHandl } from "./services/errHandler.js";
// whitelist
const whiteList = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];
const corsOptions = {
  origin: function (origin, next) {
    if (!origin || whiteList.indexOf(origin) != -1) {
      next(null, true);
    } else {
      next(new Error("Origin not allowed!"));
    }
  },
};
// =
const server = express();
const port = process.env.PORT;
server.use(cors(corsOptions));
server.use(express.json());
// routes
server.use("/media", mediaR);
// error handlers
server.use(regErrHandl);
server.use(genericErrHandl);

// listen
server.listen(port, () => {
  console.log(port);
});
console.table(listEndpoints(server));
