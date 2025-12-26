require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const healthRecordsRoutes = require("./routes/healthRecords");
const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware");
const goalsRoutes = require("./routes/goals");
const aiRoutes = require("./routes/ai"); // ✅ DODANE

const app = express();

app.use(cors());
app.use(express.json());

// publiczne
app.use("/auth", authRoutes);

// wymagają tokenu
app.use("/records", authMiddleware, healthRecordsRoutes);
app.use("/goals", authMiddleware, goalsRoutes);
app.use("/ai", authMiddleware, aiRoutes); // ✅ DODANE

app.get("/", (req, res) => {
  res.send("API działa ✅");
});

const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Połączono z MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Serwer działa: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Błąd MongoDB:", err.message);
  });
