import express from 'express';
import fs from 'fs';
import { type } from 'os';

const router = express.Router();

let regressionModel = null;

// Endpoint to make predictions using the stored regression model
router.post("/", (req, res) => {
  const { input } = req.body;

  try {
    const data = fs.readFileSync("./utils/regressionModel.json", 'utf-8');
    regressionModel = JSON.parse(data);
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: 'Fail loading model' });
  }

  if (!regressionModel) {
    return res.status(400).json({ message: 'No model uploaded yet' });
  }

  // Simple linear regression y = ax + b
  const coefficients = regressionModel;
  const prediction = coefficients[0][0] * input[0] + coefficients[1][0] * input[1] + coefficients[2][0];
  return res.json({ prediction });
});

export default router