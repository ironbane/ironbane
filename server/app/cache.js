

// Don't cache scene files
WebApp.connectHandlers.use('/scene', function(req, res, next) {
    res.setHeader('cache-control', 'no-cache');
    next();
});