import express from "express";
import cors from "cors";
import records from "./routes/record.js";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use('/assets', express.static('utils/data'));
// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});