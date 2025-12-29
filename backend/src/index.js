const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payment");
const userRoutes = require("./routes/user");
const cardPaymentRoutes = require("./routes/cardPayment");
const historyRoutes = require("./routes/history");
const analyticsRoutes = require("./routes/analytics");
const adminRoutes = require("./routes/admin");

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
	res.status(200).json({ status: "OK", message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/card", cardPaymentRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);

// Error handling
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
	setImmediate(() => {
		console.log(`✅ PerfectPay Backend running on port ${PORT}`);
		console.log(`✅ Server listening on http://localhost:${PORT}`);
		console.log(`✅ Health check: http://localhost:${PORT}/health`);
	});
});

server.on("error", (error) => {
	console.error("Server error:", error);
	process.exit(1);
});

process.on("unhandledRejection", (error) => {
	console.error("Unhandled rejection:", error);
});
