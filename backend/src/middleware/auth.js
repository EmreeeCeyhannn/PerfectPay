const { verifyToken } = require("../config/jwt");

const authMiddleware = (req, res, next) => {
	try {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "Access token required" });
		}

		const decoded = verifyToken(token);
		if (!decoded) {
			return res.status(401).json({ error: "Invalid or expired token" });
		}

		req.userId = decoded.userId;
		next();
	} catch (error) {
		res.status(500).json({ error: "Authentication failed" });
	}
};

module.exports = authMiddleware;
