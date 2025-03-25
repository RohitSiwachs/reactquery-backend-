const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");
const app = express();
const port = 2000;
const dbFile = "db.json";

app.use(cors());
app.use(express.json());

// Function to read data from db.json
const corsOptions = {
  origin: "*",
  methods: ["POST", "GET", "DELETE", "PUT"],
  allowedHeaders: ["Content-Type"], // Fix 'allowHeaders' -> 'allowedHeaders'
};

app.use(cors(corsOptions));
const readData = () => {
  try {
    if (!fs.existsSync(dbFile)) {
      console.error("Database file does not exist. Creating a new one.");
      fs.writeFileSync(dbFile, "[]"); // Initialize as an empty array
      return [];
    }

    const jsonData = fs.readFileSync(dbFile, "utf-8").trim();
    if (!jsonData) {
      console.error("Database file is empty. Initializing as an empty array.");
      fs.writeFileSync(dbFile, "[]");
      return [];
    }

    return JSON.parse(jsonData);
  } catch (error) {
    console.error("Error reading or parsing database file:", error);
    return [];
  }
};

// Function to write data to db.json
const writeData = (data) => {
  try {
    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid data format. Expected an array.");
    }
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), "utf-8");
    console.log("Database file updated successfully."); // ✅ Debugging log
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
};

// Create API - Add new data
app.post("/create", (req, res) => {
  const { name, rollno, section } = req.body;

  if (!name || !rollno || !section) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const data = readData(); // Read existing data

  const newdata = {
    id: uuidv4(),
    name,
    rollno,
    section,
  };

  data.push(newdata);
  writeData(data);

  return res.status(201).json({ message: "Data created", data: newdata });
});

// Get API - Retrieve data by ID
app.get("/allPost", (req, res) => {
  const data = readData();

  return res
    .status(200)
    .json({ message: "Data found successfully", data: data });
});

app.put("/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, rollno, section } = req.body;
  const data = readData();
  const index = data.findIndex((item) => item.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Data not found" });
  }

  if (name) data[index].name = name;
  if (rollno) data[index].rollno = rollno;
  if (section) data[index].section = section;

  writeData(data);
  return res
    .status(200)
    .json({ message: "data is updated", data: data[index] });
});

app.delete("/delete/:id", (req, res) => {
  const { id } = req.params;
  const data = readData();
  const existingData = data.some((item) => item.id === id);
  if (!existingData) {
    res.status(400).json({ message: "data not found" });
  }

  let newdata = data.filter((item) => item.id !== id);

  writeData(newdata);
  return res.status(200).json({ message: "data deleted" });
});

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});
