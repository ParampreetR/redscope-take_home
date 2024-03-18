import express from "express";
import fs from "fs";
import path from "path";
import { dataFolderName } from "./constants.js";
import { closeSession, startSession } from "./web_socket.js";

const __dirname = path.resolve();

const startHttpServer = () => {
  const app = express();
  app.use(express.static("public"));

  app.get("/rrweb-events", (req, res) => {
    /// * Changes
    /// * Check if user provided ID
    if (req.query.id) {
      res.sendFile(__dirname + "/public/rrweb_events.html");
    } else {
      res.send("Please provide id");
    }
  });

  // Nested routing (api/rrweb_events) is a bit tricky, leaving for the take home assignment
  app.get("/api-rrweb-events", (req, res) => {
    /// * Changes
    /// * Check if user provided ID
    console.log(req.query.id);
    if (req.query.id) {
      return res.send(fetchRrwebEvents(req.query.id));
    } else {
      return res.send("Please provide id");
    }
  });

  /// * Added
  /// * I'm assuming an API route to start a server and close the server
  app.get("/start-server", (req, res) => {
    startSession();
    res.send("Session Started");
  });

  app.get("/close-server", (req, res) => {
    closeSession();
    res.send("Session Closed");
  });

  const port = 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

const fetchRrwebEvents = (id) => {
  const fileList = fs.readdirSync(dataFolderName);

  const fileName = fileList.filter((val) => {
    return val.split("_")[0] === id;
  });

  if (fileName.length == 0) {
    console.log("file not found");
    return null;
  }

  const dataFilePath = path.join(dataFolderName, fileName[0]);
  const rrwebEvents = fs.readFileSync(dataFilePath, "utf-8");
  return rrwebEvents
    .split("\n")
    .filter((line) => line.length > 0)
    .map((ff) => JSON.parse(ff));
};

export { startHttpServer };
