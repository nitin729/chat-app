import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/db.js";

dotenv.config();
const port = process.env.PORT;

connectDB()
  .then(() => {
    app.listen(port || 5000, () => {
      console.log(`Server listening on port ${port}`);
    });
  })
  .catch((err) => console.error(`Mongodb connection error: ${err}`));
