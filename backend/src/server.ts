import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { env } from "./config/env.js";

const app = createApp();

const start = async () => {
  await connectDatabase(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    console.log(`Smart TaskOps API fut a ${env.PORT} porton.`);
  });
};

const stop = async () => {
  await disconnectDatabase();
  process.exit(0);
};

process.on("SIGINT", () => {
  void stop();
});

process.on("SIGTERM", () => {
  void stop();
});

void start();
