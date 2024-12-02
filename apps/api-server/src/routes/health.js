const express = require('express');
let router = express.Router();

router
  .route('/health')
  .get(async function (req, res) {
    res.status(200).json({
        status: 'UP',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
      });
  })

module.exports = router;
