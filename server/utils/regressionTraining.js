// This file is used to demonstrate how to apply regression on equipments in the ports. In this case, we use the Li-ion battery shown on our prototype (Li-ion batter)

import fs from 'fs';
import MultivariateLinearRegression from 'ml-regression-multivariate-linear';

// Function to generate a random integer between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateInputData(num) {
  const inputData = [];

  for (let i = 0; i < num; i++) {
      const firstValue = getRandomInt(30, 45); // Random value between 30 and 45 => represent the average working temperature of battery
      const secondValue = getRandomInt(-50, 50); // Random value between -50 and 50 => represent the difference in days between actual replacement of battery and expected replacement lifespan of battery specified by manufacturer
      inputData.push([firstValue, secondValue]);
  }

  return inputData;
}

function generateOutputData(num) {
  const outputData = [];

  for (let i = 0; i < num; i++) {
      const value = getRandomInt(730, 3650); // Random positive value between 730 (2 years) to 3650 (10 years) => represent the actual lifespan of battery
      outputData.push([value]);
  }

  return outputData;
}

export default function train_regression() {
  // 
  const X = generateInputData(100)
  
  const y = generateOutputData(100)

  console.log(X, y)
  
  // Train the multivariate linear regression model
  const regression = new MultivariateLinearRegression(X, y);
  
  // Get the model's coefficients (weights)
  const modelData = regression.weights
  
  // Save the model parameters to a JSON file
  fs.writeFileSync('./utils/regressionModel.json', JSON.stringify(modelData));
  
  console.log('Model trained and saved successfully.');
}