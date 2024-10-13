import express from "express";
import * as cheerio from "cheerio"
import axios from "axios"
// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import { fileURLToPath } from "url";
import { dirname } from "path";
import KNN from "ml-knn"
// import JSON from "json";
// Get the __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);  
const __dirname = dirname(__filename);

// Now use __dirname to resolve paths
import fs from "fs";
import path from "path";


// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const router = express.Router();

// Web scraping

const scrapedData = []
async function Scraper() {
  const url = "https://www.channelnewsasia.com/world";
  const result = [];
  // Use await directly on axios
  const response = await axios(url);
  const html_data = response.data;
  const $ = cheerio.load(html_data);

  const keys = ["War", "Geopolitical Tension", "Risk"];
  const selectedElem = ".views-infinite-scroll-content-wrapper > .row > .col-6 > .product-7 > .product-body";
  
  $(selectedElem).each((parentIndex, parentElem) => {
    let keyIndex = 0;
    const data = {};
    if (parentIndex) {  // Skip the first element
      $(parentElem).children().each((childId, childElem) => {
        const value = $(childElem).text().trim();
        if (value) {
          data[keys[keyIndex]] = value;
          keyIndex++;
        }
      });
      result.push(data);
    }
  });
  return result;
}
router.get("/scrape", async (req, res) => {
  try {
    const data = await Scraper();
    // Define the output directory and file name
    const outputDir = path.join(__dirname, '../utils/data');
    const outputFile = path.join(outputDir, 'scrapedData.json');

    // Ensure the directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Write the scraped data to a JSON file
    fs.writeFile(outputFile, JSON.stringify(scrapedData, null, 2), (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return res.status(500).send('Error saving data.');
        }
        console.log('Data saved to', outputFile);
    });
    return res.status(200).json({
      result: data,
    });
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    });
  }
});

// ML training
router.post("/predictCE", async (req, res) => {
    const srcPort = req.body.srcPort;
    const dstPort = req.body.dstPort;
    console.log(srcPort);
    console.log(dstPort);

    const filteredPorts = [
        {
            portID: 1,
            portName: "Tanjong Pagar",
            lat: 1.2634,
            lng: 103.8467,
        },
        {
            portID: 2,
            portName: "Keppel",
            lat: 1.2623,
            lng: 103.8429,
        },
        {
            portID: 3,
            portName: "Brani",
            lat: 1.2565,
            lng: 103.8445,
        },
        {
            portID: 4,
            portName: "Pasir Panjang",
            lat: 1.27,
            lng: 103.7632,
        },
        {
            portID: 5,
            portName: "Tuas",
            lat: 1.3078,
            lng: 103.6318,
        },
        {
            portID: 6,
            portName: "Antwerp",
            lat: 51.2602,
            lng: 4.3997,
        },
        {
            portID: 7,
            portName: "Sines",
            lat: 37.9561,
            lng: -8.8698,
        },
        {
            portID: 8,
            portName: "Rotterdam",
            lat: 51.9531,
            lng: 4.1226,
        },
        {
            portID: 9,
            portName: "Mumbai",
            lat: 18.9543,
            lng: 72.8496,
        },
        {
            portID: 10,
            portName: "Guangzhou",
            lat: 22.8292,
            lng: 113.6167,
        },
        {
            portID: 11,
            portName: "Busan",
            lat: 35.0988,
            lng: 129.0403,
        },
        {
            portID: 12,
            portName: "Chennai",
            lat: 13.0853,
            lng: 80.2916,
        },
        {
            portID: 13,
            portName: "Panama",
            lat: 8.95,
            lng: -79.5665,
        },
        {
            portID: 14,
            portName: "Buenos Aires",
            lat: -34.6081,
            lng: -58.3702,
        },
        {
            portID: 15,
            portName: "New York",
            lat: 40.6494,
            lng: -74.026,
        },
        {
            portID: 16,
            portName: "Dammam",
            lat: 26.4283,
            lng: 50.101,
        },
        {
            portID: 17,
            portName: "Port Said",
            lat: 31.2653,
            lng: 32.3019,
        },
        {
            portID: 18,
            portName: "Durban",
            lat: -29.8716,
            lng: 31.0262,
        },
    ];
    // Helper function to calculate distance between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const toRadians = (deg) => deg * (Math.PI / 180);
        const R = 6371; // Radius of Earth in km
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
                Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // Function to preprocess data and create a training set
    const preprocessData = (data) => {
        const UK_LAT = 51.5074;
        const UK_LON = -0.1278;

        return data.map((row) => {
            const [city, code, seaCost, airCost, lat, lon] = row;
            const seaCostParsed = parseFloat(seaCost);
            const airCostParsed = airCost ? parseFloat(airCost) : 0;
            const distance = calculateDistance(UK_LAT, UK_LON, lat, lon);

            // Cost efficiency rating (for training) - can be between 1 and 5 (manually added, or heuristic)
            const costEfficiency = Math.random() * 4 + 1; // Replace this with real ratings if you have them

            return {
                city: city.slice(1),
                code: code.slice(2, -1),
                seaCost: seaCostParsed,
                airCost: airCostParsed,
                lat: parseFloat(lat),
                lon: parseFloat(lon),
                distance,
                costEfficiency,
            };
        });
    };

    // Load and preprocess data
    const dataPath = path.join(
        __dirname,
        "../utils/data/shipping_data_with_coordinates.csv"
    );
    const rawData = fs
        .readFileSync(dataPath, "utf8")
        .trim()
        .split("\n")
        .map((row) => row.split(","));;
    const trainingData = preprocessData(rawData.slice(1)); // Skip header
    console.log(trainingData);
   
});

router.post("/predictRR", async (req, res) => {
  // Function to reclassify risk ratings
  const riskPath = path.join(
    __dirname,
    "../utils/data/countries_risk_ratings.csv"
  )

  const riskData = fs
  .readFileSync(riskPath, "utf8")
  .trim()
  .split("\n")
  .map((row) => row.split(","));;


    function reclassifyRisk(riskRating) {
        if (riskRating <= 1.5) return 1;
        else if (riskRating <= 2.0) return 2;
        else if (riskRating <= 2.5) return 3;
        else if (riskRating <= 3.0) return 4;
        else return 5;
    }

  // Function to fetch CSV data and preprocess
  function fetchData() {
      const filteredPorts = [
        {
            portID: 1,
            portName: "Tanjong Pagar",
            lat: 1.2634,
            lng: 103.8467,
        },
        {
            portID: 2,
            portName: "Keppel",
            lat: 1.2623,
            lng: 103.8429,
        },
        {
            portID: 3,
            portName: "Brani",
            lat: 1.2565,
            lng: 103.8445,
        },
        {
            portID: 4,
            portName: "Pasir Panjang",
            lat: 1.27,
            lng: 103.7632,
        },
        {
            portID: 5,
            portName: "Tuas",
            lat: 1.3078,
            lng: 103.6318,
        },
        {
            portID: 6,
            portName: "Antwerp",
            lat: 51.2602,
            lng: 4.3997,
        },
        {
            portID: 7,
            portName: "Sines",
            lat: 37.9561,
            lng: -8.8698,
        },
        {
            portID: 8,
            portName: "Rotterdam",
            lat: 51.9531,
            lng: 4.1226,
        },
        {
            portID: 9,
            portName: "Mumbai",
            lat: 18.9543,
            lng: 72.8496,
        },
        {
            portID: 10,
            portName: "Guangzhou",
            lat: 22.8292,
            lng: 113.6167,
        },
        {
            portID: 11,
            portName: "Busan",
            lat: 35.0988,
            lng: 129.0403,
        },
        {
            portID: 12,
            portName: "Chennai",
            lat: 13.0853,
            lng: 80.2916,
        },
        {
            portID: 13,
            portName: "Panama",
            lat: 8.95,
            lng: -79.5665,
        },
        {
            portID: 14,
            portName: "Buenos Aires",
            lat: -34.6081,
            lng: -58.3702,
        },
        {
            portID: 15,
            portName: "New York",
            lat: 40.6494,
            lng: -74.026,
        },
        {
            portID: 16,
            portName: "Dammam",
            lat: 26.4283,
            lng: 50.101,
        },
        {
            portID: 17,
            portName: "Port Said",
            lat: 31.2653,
            lng: 32.3019,
        },
        {
            portID: 18,
            portName: "Durban",
            lat: -29.8716,
            lng: 31.0262,
        },
    ];
    // console.log(req.body.srcPort)
    const srcPort = filteredPorts.find((item) => item.portID === req.body.srcPort);
    const dstPort = filteredPorts.find((item) => item.portID === req.body.dstPort);
    
    // console.log(srcPort);
    // console.log(dstPort);
    const data = [];
    let lines = riskData;
    lines = lines.map(row => row.map(item => item.replace(/(\r\n|\n|\r)/gm, "")));
    const headerRow = lines[0];
    // console.log(lines, headerRow)

      // Skip header row

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        const rowData = {};
        for (let j = 1; j < row.length; j++) {
          rowData[headerRow[j]] = parseFloat(row[j]);
        }
        data.push({
          latitude: rowData.Latitude,
          longitude: rowData.Longitude,
          riskRating: reclassifyRisk(rowData.Risk_rating)
        });
      }
      // Split data into training and testing sets
      const trainingData = data.slice(0, Math.floor(data.length * 0.8));
      const testingData = data.slice(Math.floor(data.length * 0.8));
      const train_dataset = trainingData.map((item) => [item.latitude, item.longitude])
      const train_label = trainingData.map((item) => [item.riskRating])
      // Create KNN classifier
      const risk_classifier = new KNN(train_dataset, train_label, {k:1});

      // Helper function to calculate distance between two coordinates
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
          const toRadians = (deg) => deg * (Math.PI / 180);
          const R = 6371; // Radius of Earth in km
          const dLat = toRadians(lat2 - lat1);
          const dLon = toRadians(lon2 - lon1);
          const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) *
                  Math.cos(toRadians(lat2)) *
                  Math.sin(dLon / 2) *
                  Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
      };

      // Function to preprocess data and create a training set
      const preprocessData = (data) => {
          const UK_LAT = 51.5074;
          const UK_LON = -0.1278;

          return data.map((row) => {
              const [city, code, seaCost, airCost, lat, lng] = row;
              const seaCostParsed = parseFloat(seaCost);
              const airCostParsed = airCost ? parseFloat(airCost) : 0;
              const distance = calculateDistance(UK_LAT, UK_LON, lat, lng);

              // Cost efficiency rating (for training) - can be between 1 and 5 (manually added, or heuristic)
              const costEfficiency = Math.random() * 4 + 1; // Replace this with real ratings if you have them

              return {
                  city: city.slice(1),
                  code: code.slice(2, -1),
                  seaCost: seaCostParsed,
                  airCost: airCostParsed,
                  lat: parseFloat(lat),
                  lng: parseFloat(lng),
                  distance,
                  costEfficiency,
              };
          });
      };

      // Load and preprocess data
      const dataPath = path.join(
          __dirname,
          "../utils/data/shipping_data_with_coordinates.csv"
      );
      const rawData = fs
          .readFileSync(dataPath, "utf8")
          .trim()
          .split("\n")
          .map((row) => row.split(","));;
      const processedData = preprocessData(rawData.slice(1)); // Skip header
      // console.log(processedData)

      const ce_data = []
      for (const row of processedData) {
        ce_data.push({
          distance: row.distance,
          costEfficiency: row.costEfficiency
        });
      }
      // console.log(ce_data)
      // Split data into training and testing sets
      const trainingCEData = ce_data.slice(0, Math.floor(ce_data.length * 0.8));
      const testingCEData = ce_data.slice(Math.floor(ce_data.length * 0.8));
      const train_CEdataset = trainingCEData.map((item) => [item.distance])
      const train_CElabel = trainingCEData.map((item) => [item.costEfficiency])
      // Create KNN classifier
      const CE_classifier = new KNN(train_CEdataset, train_CElabel, {k:1});
      // Make predictions on testing data
      // testingCEData.forEach((row) => {
      //   const predictedCE = CE_classifier.predict([row.distance]);
      //   console.log(`Actual Risk: ${row.costEfficiency}, Predicted Risk: ${predictedCE}`);
      // });

      function findBestRoute(origin, destination, data, riskClassifier, CE_classifier) {
        // Generate potential routes
        const routes = [];
        for (const city of data) {
          if (city.city !== origin && city.city !== destination) {
            routes.push([origin, city, destination]);
          }
        }
        routes.push([origin, destination]); // Direct route;
      
        // Calculate risk and weighted score for each route
        // const routeScores = routes.map(route => {
        //   const risk = calculateAverageRisk(route, riskClassifier);
        //   const costEfficiency = calculateAverageCostEfficiency(route, CE_classifier);
        //   let weightedScore = (1 / risk) * costEfficiency;
        //   const scalingFactor = 4;
        //   weightedScore = Math.min(weightedScore * scalingFactor, 5); // Capping the score at 5
        //   // console.log(risk, costEfficiency)
        //   return { route, risk, costEfficiency, weightedScore };
        // });
        // Step 1: Calculate weighted scores without normalization to find min and max
        const weightedScores = routes.map(route => {
          const risk = calculateAverageRisk(route, riskClassifier);
          const costEfficiency = calculateAverageCostEfficiency(route, CE_classifier);
          return (1 / risk) * costEfficiency; // Raw weighted score
        });

        // Step 2: Calculate min and max weighted scores
        const minWeightedScore = Math.min(...weightedScores);
        const maxWeightedScore = Math.max(...weightedScores);

        // Step 3: Normalize each score using the min and max values
        const routeScores = routes.map((route, index) => {
          const risk = calculateAverageRisk(route, riskClassifier);
          const costEfficiency = calculateAverageCostEfficiency(route, CE_classifier);
          let weightedScore = weightedScores[index]; // Use the precomputed weighted score

          // Normalize the weighted score between 0 and 5
          weightedScore = ((weightedScore - minWeightedScore) / (maxWeightedScore - minWeightedScore)) * 5;

          return { route, risk, costEfficiency, weightedScore };
        });

        // Find the best route
        const bestRoute = routeScores.reduce((best, current) => {
          return current.weightedScore > best.weightedScore ? current : best;
        }, routeScores[0]);

        const normalRoute = routeScores.reduce((best, current) => {
          return current.costEfficiency > best.costEfficiency ? current : best;
        }, routeScores[0]);
        // console.log(bestRoute)
      
        return {bestRoute:bestRoute, normalRoute:normalRoute};
      }
      
      function calculateAverageRisk(route, risk_classifier) {
        const avg_risk = [];
        const test_set = []
        for (const city of route){
            // console.log(city)
            test_set.push([city.lat, city.lng])
        }
        const prediction = risk_classifier.predict(test_set)
        let avg = 0;
        for (const arr of prediction){
            avg += arr[0]
        }
        // console.log(avg/prediction.length)
        return avg/prediction.length
        
      }
      
      function calculateAverageCostEfficiency(route, CE_classifier) {
        const avg_CE = [];
        const test_set = [];
        for (let i=0; i < route.length - 1; i++){
            const distance = calculateDistance(route[i].lat, route[i].lng, route[i+1].lat, route[i+1].lng);
            test_set.push([distance]);
            // console.log(prediction)
        }
        const prediction = CE_classifier.predict(test_set)
        let avg= 0;
        for (const arr of prediction){
          avg += arr[0]
        }
        // console.log(avg/prediction.length)
        return avg/prediction.length
      }
      

      return findBestRoute(srcPort, dstPort, processedData, risk_classifier, CE_classifier)

  }

  // Call the fetchData function
  const best_route = fetchData();
  console.log(best_route)
  return res.send(best_route).status(200)
})

// This section will help you get a list of all the records.
router.get("/", async (req, res) => {
    let collection = await db.collection("records");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
});

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
    let collection = await db.collection("records");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
});

// This section will help you create a new record.
router.post("/", async (req, res) => {
    try {
        let newDocument = {
            name: req.body.name,
            position: req.body.position,
            level: req.body.level,
        };
        let collection = await db.collection("records");
        let result = await collection.insertOne(newDocument);
        res.send(result).status(204);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error adding record");
    }
});

// This section will help you update a record by id.
router.patch("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };
        const updates = {
            $set: {
                name: req.body.name,
                position: req.body.position,
                level: req.body.level,
            },
        };

        let collection = await db.collection("records");
        let result = await collection.updateOne(query, updates);
        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error updating record");
    }
});

// This section will help you delete a record
router.delete("/:id", async (req, res) => {
    try {
        const query = { _id: new ObjectId(req.params.id) };

        const collection = db.collection("records");
        let result = await collection.deleteOne(query);

        res.send(result).status(200);
    } catch (err) {
        console.error(err);
        res.status(500).send("Error deleting record");
    }
});

export default router;
