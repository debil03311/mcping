import { App } from '@tinyhttp/app'
import { ping } from "minecraft-server-ping";
import { readFileSync } from "fs";

const PORT = process.env.PORT || 5000;
const MAX_TIMEOUT = 4000;

const app = new App()

app.get("/", (request, response)=> {
  const file = readFileSync("./public/index.html",
    { encoding: "utf-8" });

  response.status(200);
  response.send(file);
});

app.get("/favicon.ico", (request, response)=> {
  const file = readFileSync("./public/favicon.ico");

  response.status(200);
  response.type("image/x-icon");
  response.send(file);
});

app.get('/:address', async (request, response)=> {
  const serverAddress = request.params.address.split(":");

  try {
    const serverData = await ping(
      serverAddress[0],
      serverAddress[1] || 25565,
      { timeout: MAX_TIMEOUT });

    response.status(200);
    response.json({ ...serverData });
  }

  catch (ERROR) {
    console.error(ERROR);

    if (ERROR.message.includes("Timed out"))
      response.status(504); // Timed out
    else
      response.status(502); // Bad gateway

    response.send(`The server at <code>${request.params.address}</code> could not be reached.<br><br><code>${ERROR.message}</code>`);
  }
});

app.listen(PORT, ()=> console.log(`Listening on ${PORT}`));