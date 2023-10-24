const jwt = require('jsonwebtoken');

// Middleware function for user authentication using JWT
const fetchuser = (req, res, next) => {
    // Retrieve the JWT token from the 'auth-token' header
    const token = req.header('auth-token');

    // Check if a token is provided in the request
    if (!token) {
        return res.status(401).json({
            message: "Authorization token is missing. Please log in to get a valid token."
        });
    }

    try {
        // Verify the JWT token using the application's secret key
        const jwtString = jwt.verify(token, process.env.SECRET_KEY);
        
        // Attach the user information from the token to the request for later use
        req.user = jwtString.user;
        
        // Continue to the next middleware or route handler
        next();
    } catch (err) {
        // Handle token verification errors, including expired or invalid tokens
        return res.status(403).json({
            message: "Invalid token or token has expired. Please log in again."
        });
    }
}

module.exports = fetchuser;
