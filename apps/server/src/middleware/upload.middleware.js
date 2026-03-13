const upload = require('../config/multer');

// Single file upload middleware
exports.uploadSingle = (fieldName) => upload.single(fieldName);

// Multiple files upload middleware
exports.uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);

// Mixed fields upload
exports.uploadFields = (fields) => upload.fields(fields);
