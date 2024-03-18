import { WebSocket, WebSocketServer } from "ws";
import fs from "fs-extra";
import { dataFolderName } from "./constants.js";
import path from "path";
import { base64encode, base64decode } from "nodejs-base64";

var wsList = [];
const startWebSocketServer = () => {
  const wss = new WebSocketServer({ port: 3008 });
  wss.on("connection", async (_ws) => {
    console.log("WebSocket connection established.");
    wsList.push(_ws);

    // Handle incoming messages
    _ws.on("message", (message) => {
      const payload = JSON.parse(message.toString());
      console.log(payload);
      if (payload.type == "session Id Change") {
        if (payload.data != undefined) {
          if (payload.data == "-1") {
            closeSession();
          } else {
            startSession(payload.data);
          }
        }
      } else {
        processPayload(payload);
      }
    });
  });
};

let lastUrl = null;
let id = 0;

/// * Added
/// * To start the session of the user.
/// * This function will be called by a route handler in http_server
/// * Session ID will be set on server and then sent to chrome extension
export const startSession = (id) => {
  let connectedClients = 0;
  wsList.forEach((ws, index) => {
    if (ws != undefined && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ operation: "setSession", id: id }), (err) => {
        if (err) {
          connectedClients--;
          console.error(err);
        } else {
          connectedClients++;
          if (connectedClients >= 2) {
            /* Why >= 2?
             * One client is from where we recieved the start session command
             * Second client is from where we will record the browser session
             */
            console.log("Sesson Started");

            // Create a new file where all session data will be appended
            let dataFilePath = path.join(dataFolderName, id);
            console.log(dataFilePath);
            fs.writeFile(dataFilePath, "");
          }
        }
      });
    } else {
      console.log("Error opening session");
    }
  });
};

export const closeSession = () => {
  wsList.forEach((ws, index) => {
    if (ws != undefined && ws.readyState === WebSocket.OPEN) {
      console.log("Closing Session");
      ws.send(JSON.stringify({ operation: "closeSession" }));
    }
  });
};

const processPayload = (payload) => {
  const { type, url, data, id } = payload;
  console.log("*".repeat(80));
  console.log({ type, url, payload });
  console.log("*".repeat(80));

  if (type !== "rrweb events") {
    return;
  }
  const jsonData = JSON.parse(data);

  let dataFilePath;
  /***  This section was not needed in 3rd task of assignment
  if (url === lastUrl) {
    // Simply append to the same file;  No change
    dataFilePath = path.join(dataFolderName, id + "_" + base64encode(url));
    fs.writeJsonSync(dataFilePath, jsonData, { flag: "a" });
  } else {
    /// * Change:
    /// * Storing each URL in separate file
    /// * I choose to encode url in base64 so it doesn't conflict with filesystem path
    /// * Filename will be as follows: "{id}_{base64encode(url)}"
    /// * "id" to keep track of when this URL was visited
    dataFilePath = path.join(dataFolderName, id + "_" + base64encode(url));
    console.log(dataFilePath);
    fs.writeJsonSync(dataFilePath, jsonData); // This would empty the files if there's already content
  }
  */

  /*** Instead added another logic without if statement */
  if (!id) {
    console.log("Invalid Session ID");
    return;
  }
  dataFilePath = path.join(dataFolderName, id);
  fs.writeJsonSync(dataFilePath, jsonData, { flag: "a" });

  // lastUrl = url;
};

export { startWebSocketServer };
