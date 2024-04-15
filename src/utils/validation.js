const { param, validationResult } = require('express-validator');

const defaultBodyFn = errors => ({ error: Object.values(errors)[0].msg });

const validationResultHandlerFactory =
  (statusCodeFn = _errors => 422, bodyFn = defaultBodyFn) =>
  (req, res, next) => {
    const errors = validationResult(req);
    const mappedErrors = errors.mapped();

    if (!errors.isEmpty()) {
      return res.status(statusCodeFn(mappedErrors)).json(bodyFn(mappedErrors));
    }

    next();
  };

const jsonFilenameValidator = param('filename')
  .isString()
  .withMessage('Filename must be a string')
  .matches(/^[^\/\\\:\*\?\"\<\>\|]{1,250}\.json$/)
  .withMessage('Filename must have from 1 to 250 characters before the .json extension and cannot contain any of the following characters: / \\ : * ? " < > |');

const filenameValidationErrorHandler = validationResultHandlerFactory(() => 400);

const jsonFilenameValidationHandlers = [jsonFilenameValidator, filenameValidationErrorHandler];

module.exports = { jsonFilenameValidationHandlers };
