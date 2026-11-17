import mongoose from "mongoose";
import { app } from "./app";
import { config } from "./config";

async function main() {
  await mongoose.connect(config.mongoUri);
  await mongoose.connection.syncIndexes(); // ensures the unique email index exists
  app.listen(config.port, () => console.log(`Server listening on port ${config.port}`));
}

main().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});