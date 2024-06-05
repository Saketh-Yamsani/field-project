const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifytoken(req, res, next) {
    // Get bearer token from headers of request
    const bearertoken = req.headers.authorization;
    // If bearer token not available
    if (!bearertoken) {
        return res.status(401).send({ message: "Unauthorized access. Please login to continue" });
    }
    const token = bearertoken.split(' ')[1];
    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        // If the token is valid, attach the decoded payload to the request
        req.user = decoded;
        next(); // Proceed to the next middleware
    } catch (err) {
        // If the token is invalid, return an unauthorized response
        return res.status(401).send({ message: "Unauthorized access. Please login to continue" });
    }
}

module.exports = verifytoken;
