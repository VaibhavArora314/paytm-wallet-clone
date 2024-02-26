const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config");

const authMiddleware = async (req,res,next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({
            message: "Invalid token/format",
        });
    }

    const jwtToken = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(jwtToken,JWT_SECRET);

        if (decoded.userId) {
            req.userId = decoded.userId;
            next();
        } else {
            return res.status(403).json({
                message: "Invalid token/format",
            });
        }
    } catch (error) {
        return res.status(403).json({
            message: "Invalid token/format",
        });
    }
}

module.exports = {
    authMiddleware
}