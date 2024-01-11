const express = require("express");
import { AppDataSource } from "./data-source";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/recipe", require("./routes/recipeRoutes"));

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
