// Role middleware - re-exports from auth.middleware for convenience
const { restrictTo } = require('./auth.middleware');

module.exports = { restrictTo };
