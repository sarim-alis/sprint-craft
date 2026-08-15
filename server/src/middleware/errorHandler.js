const errorHandler = (err, _req, res, _next) => {
    if (err.code === "23505") {
        return res.status(409).json({ error: "Resource already exists" });
    }

    const status = err.statusCode || err.status || 500;
    const isKnown = Boolean(err.isApiError || err.statusCode || err.status);

    if (status >= 500) {
        console.error("Server error:", err);
    }

    res.status(status).json({
        error: isKnown ? err.message : "Internal server error"
    });
};

const notFoundHandler = (_req, res) => {
    res.status(404).json({ error: "Route not found" });
};

module.exports = { errorHandler, notFoundHandler };
