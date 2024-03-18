# TLDR

I have solved task 1, 2 and 3. I doubt my approach to solve 3rd task, it's working now at current tab but not 100% accurate as what you people might look for.

# Task 1 (Solved)

### Question

1. Can you expand on the code in node.js (this exercise does not require any changes to Chrome plugin) so that every URL is saved in its own file.
2. Make changes to the html page , so that by passing a query parameter like ?id=1 can show you the first URL visited. Passing ?id=2 shows the second URL visited
3. As part of this exercise, assume that the user would always open a new tab with a new URL. You can safely assume that the URL’s we recieve on the backend are always unique

### Solution

- Instead of saving the URL inside the file, I have named the file in the following pattern - {id}\_base64encode({url})
- When searching for the file, it'll interate through all files in the data directory when id matches with req.query.id. It'll return the data of that file.
- Here each URL was compared with the last URL visited and I didn't try to change it due to assumption.

# Task 2 (Solved)

### Question

1. The user is creating a sessionId on the server, which means that the payload sent by Chrome does not have any sessionId in it.
2. The first ask is to pass this sessionId to Chrome plugin and the plugin sends data with sessionId in the payload
3. If there is no sessionId that the server has sent (ie. very beginning when user has not clicked on start session button), Chrome plugins should not send data
4. When the user clicks on stop session button, Chrome plugin should also stop sending data

### Solution

_Web Server and Web Socket_

- Without reading "how to test part" here, I have assumed an API route for start server (you might see that in my commented code)
- So firstly I have implemented a route that will send the session ID incrementally - 1, next time 2 and so on
- Later I changed code to get session ID from the client side web socket implemented at http://localhost:3000/
- It notifies all connected clients to start session. Server also logs "Session started" if 2 clients are connected because one is from where we recieved session id and other from where we will start session.
- I have implemented `-1` as signal to close the session

_Chrome Plugin_

- In chrome plugin, I added `onmessage` event to look for specific session messages
- It'll addListener to `chrome.runtime` if it receives "setSession" with `payload.id`
- On "closeSession", it'll remove the `chrome.runtime` listener.

# Task 3 (Solved)

### Question

1. Check why the rrweb video does not work on existing tab, on changing sessionId

### Solution

- I tried to look for online solution and read some of the articles given but I still didn't found that exact solution that I was looking for.
- Nearest to what I got was this thread - https://github.com/rrweb-io/rrweb/issues/69#issuecomment-487889500
- Instead I have implemented a workaround. It could not be the best implementation but I tried my best.
- (In Chrome Plugin) I have saved the lastest `full snapshot` and `meta` event represented by id `2` and `4` respectively
- On each start session event in chrome plugin, it looks for the lastest `full snapshot` and `meta` data and sends it to server.
- So now it's working on existing tabs also

# Bonus Task 4 (Tried)

### Question

1. If you can show the sessionId in Chrome plugin, in the options page. Options page is the one that opens when user clicks on the Chrome plugin icon

### What I tried

- I have added popup.html in manifest.json
- I have also implemented a `chrome.runtime.onMessage.addListener` in popup.js but it was not working for some reason
- I tried storing the sessionId to chrome's local storage but still it was returning `undefined`
- I searched for some solutions but couldn't get any

Lastly, Thanks a lot... I have learned a lot from this assignment. I'm glad that I have experienced something new than coding usual node.js routes.
