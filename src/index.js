const path = require("path");
const dns = require("dns");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

if (!process.env.DYNO) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("./models/Todo");

const taskRoutes = require("./routes/tasks");

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV === "production"
    ? ""
    : "mongodb://localhost:27017/todo-backend");

let isDbConnected = false;

app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.options(/.*/, cors());
app.use(express.json());
app.set("etag", false);

app.use(["/api", "/todo"], (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Todo backend is running",
    dbConnected: isDbConnected,
  });
});

app.use("/api/tasks", (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ message: "Database is not connected yet." });
  }
  next();
}, taskRoutes);

app.use("/todo", (req, res, next) => {
  if (!isDbConnected) {
    return res.status(503).json({ message: "Database is not connected yet." });
  }
  next();
}, taskRoutes);

async function connectDatabase() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  isDbConnected = true;
  console.log("연결성공");
}

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `포트 ${PORT}번이 이미 사용 중입니다. 다른 터미널에서 서버가 실행 중인지 확인하거나, 해당 프로세스를 종료한 후 다시 시도하세요.`
      );
      process.exit(1);
    }
    throw err;
  });

  connectDatabase().catch((err) => {
    console.error("MongoDB 연결 실패:", err.message);
  });
}

startServer();
