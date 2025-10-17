// Server
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import logger from "./utils/logger.js";
import authRoutes from "./routes/auth.routes.js";
import appointmentRoutes from "./routes/appointments.routes.js";
import consultationRoutes from "./routes/consultation.route.js";
import reportRoutes from "./routes/report.routes.js";
import settingsRoutes from './routes/settings.routes.js';
import paymentRoutes from "./routes/payment.routes.js";
import medicalHistoryRoutes from "./routes/medicalHistory.routes.js";

const app = express();

// Stripe webhook - MUST be before express.json() middleware
// This allows us to get the raw body for signature verification
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes
);

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend working fine" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/consult", consultationRoutes);
app.use("/api/reports", reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/medical-history", medicalHistoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB", {
      timestamp: new Date().toISOString(),
    });
    app.listen(process.env.PORT, () => {
      logger.info(`Server running on port ${process.env.PORT}`, {
        timestamp: new Date().toISOString(),
      });
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1);
  });
