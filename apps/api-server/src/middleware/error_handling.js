var createError = require('http-errors');
var statuses = require('statuses');

module.exports = function (app) {
  const submitFailureMethods = new Set(['POST', 'PUT', 'DELETE']);
  const submitFailurePathPattern =
    /\/api\/project\/\d+\/(resource|submission|comment)(\/|$)/;

  function shouldLogSubmitFailure(req, status) {
    if (!req || status < 400) return false;
    if (!submitFailureMethods.has(req.method)) return false;
    const path = req.originalUrl || req.url || '';
    return submitFailurePathPattern.test(path);
  }

  // We only get here when the request has not yet been handled by a route.
  app.use(function (req, res, next) {
    console.log('404 handler, url: ', req.originalUrl);
    next(createError(404, 'Pagina niet gevonden'));
  });

  app.use(function handleError(err, req, res, next) {
    var env = app.get('env');
    var status =
      err.status ||
      (err.name && err.name == 'SequelizeValidationError' && 400) ||
      500;
    var userIsAdmin = req.user && req.user.role && req.user.role == 'admin';
    var showDebug = status == 500 && (env === 'development' || userIsAdmin);
    var friendlyStatus = statuses[status];
    var stack = err.stack || err.toString();
    var message = err.message || err.error;
    message = message && message.replace(/Validation error:?\s*/, '');
    var errorStack = showDebug ? stack : '';
    var requestId = req.requestId || null;

    if (shouldLogSubmitFailure(req, status)) {
      console.error(
        JSON.stringify({
          type: 'submit_failure',
          requestId,
          method: req.method,
          path: req.originalUrl || req.url || '',
          status,
          projectId: req.params?.projectId || null,
          userId: req.user?.id || null,
          message: String(message || '').slice(0, 500),
        })
      );
    }

    res.status(status);
    res.json({
      requestId,
      status: status,
      friendlyStatus: friendlyStatus,
      message: message,
      errorStack: errorStack.replace(/\x20{2}/g, ' &nbsp;'),
      error: message || err,
    });
  });
};
