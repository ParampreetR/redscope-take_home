let webSocket = null;
let sessionID = null;

// Storing the last full snapshot and last meta snapshot
// Sending these server when session is started
let fullSnapshot = null;
let metaSnapshot = null;

const listenerFunction = (message, sender, sendResponse) => {
  if (webSocket && webSocket.readyState === WebSocket.OPEN) {
    console.log({ ...message, id: sessionID });
    if (JSON.parse(message.data).type == 2) {
      console.log("Took full snapshot");
      fullSnapshot = message;
    }
    if (JSON.parse(message.data).type == 4) {
      console.log("Took meta snapshot");
      metaSnapshot = message;
    }
    webSocket.send(JSON.stringify({ ...message, id: sessionID }));
  } else {
    console.log("WebSocket not ready, data ignored");
  }
};

function connectToWebSocket() {
  webSocket = new WebSocket("ws://localhost:3008");

  webSocket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);
    if (data.operation == "setSession") {
      console.log("session started");
      sessionID = data.id;
      chrome.runtime.onMessage.addListener(listenerFunction);
      chrome.storage.local.set({ sessionID: sessionID });

      // ** Task 3
      // ** send last recorded meta snapshot with updated time stamp
      if (metaSnapshot) {
        console.log("Sending last meta snapshot");
        let snapshotData = JSON.parse(metaSnapshot.data);
        snapshotData.timestamp = new Date().getTime();

        metaSnapshot.data = JSON.stringify(snapshotData);
        webSocket.send(JSON.stringify({ ...metaSnapshot, id: sessionID }));
      }

      // ** send last recorded full snapshot with updated time stamp
      if (fullSnapshot) {
        console.log("Sending last full snapshot");
        let snapshotData = JSON.parse(fullSnapshot.data);
        snapshotData.timestamp = new Date().getTime();

        fullSnapshot.data = JSON.stringify(snapshotData);
        webSocket.send(JSON.stringify({ ...fullSnapshot, id: sessionID }));
      }
    } else if (data.operation == "closeSession") {
      console.log("session closed");
      chrome.runtime.onMessage.removeListener(listenerFunction);
    } else {
      console.log(data);
    }
    // Process the received message
  });

  webSocket.onopen = () => {
    console.log("WebSocket connected");
    changeIcon("../icons/server_up.png");
  };

  webSocket.onerror = (err) => {
    console.error("WebSocket error:", err);
    changeIcon("../icons/server_down.png");
  };
}

// Initial connection attempt
connectToWebSocket();

// Reconnect every 5 seconds if not connected
setInterval(() => {
  if (webSocket === null || webSocket.readyState !== WebSocket.OPEN) {
    connectToWebSocket();
  }
}, 5000);

// Message listener from content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (webSocket && webSocket.readyState === WebSocket.OPEN) {
//     console.log({ payload: message.toString() });
//     webSocket.send(JSON.stringify(message));
//   } else {
//     console.log("WebSocket not ready, data ignored");
//   }
// });

function changeIcon(imageIcon) {
  chrome.action.setIcon({ path: imageIcon });
}
