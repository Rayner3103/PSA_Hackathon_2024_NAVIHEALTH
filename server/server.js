import express from "express";
import cors from "cors";
import records from "./routes/record.js";
import regression from "./routes/regression.js";
import train_regression from "./utils/regressionTraining.js"

const PORT = process.env.PORT || 5050;
const app = express();


train_regression();
app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use('/assets', express.static('utils/data'));
app.use("/regression", regression);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});