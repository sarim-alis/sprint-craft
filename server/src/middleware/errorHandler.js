const errorHandler = (err, _req, res, _next) => {
    const status = err.status || 500;

    if (status >= 500) {
        console.error("Server error:", err);    
    }

    if (err.code === '23505') {
        return res.status(409).json({ message: "Resource already exists" });
    }

    res.status(status).json({
        error: status >= 500 ? "Internal server error" : err.message
    });
};

const notFoundHandler = (_req, res) => {
    res.status(404).json({ message: "Route not found" });
};

module.exports = { errorHandler, notFoundHandler };
