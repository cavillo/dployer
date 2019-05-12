// external dependencies
import * as _ from 'lodash';

// constants/variables
const HTTP = {
  OK: 200,
  MOVED: 301,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};
const knownErrors: any = {
  Unauthorized:
    { code: HTTP.UNAUTHORIZED, message: 'Unauthorized' },
  'No authorization header provided':
    { code: HTTP.UNAUTHORIZED, message: 'No authorization header provided' },
  'Malformed authentication header. \'Bearer accessToken\' syntax expected':
    { code: HTTP.BAD_REQUEST, message: 'Malformed authentication header. \'Bearer accessToken\' syntax expected' },
  '\'Bearer\' keyword missing from front of authorization header':
    { code: HTTP.BAD_REQUEST, message: '\'Bearer\' keyword missing from front of authorization header' },
  'Invalid token':
    { code: HTTP.UNAUTHORIZED, message: 'Invalid token' },
  'Unknown Error':
    { code: HTTP.INTERNAL_ERROR, message: 'An error occurred while trying to generate a token' },
};

// logic
export default class KnownErrors {

  public static lookupError(error: Error) {
    if (knownErrors[error.message]) {
      return knownErrors[error.message];
    }

    if (_.startsWith(error.message, 'Missing "')) {
      return { code: HTTP.BAD_REQUEST, message: error.message };
    }

    if (_.startsWith(error.message, 'Invalid "')) {
      return { code: HTTP.BAD_REQUEST, message: error.message };
    }

    if (_.endsWith(error.message, 'does not exist')) {
      return { code: HTTP.NOT_FOUND, message: error.message };
    }

    if (_.endsWith(error.message, 'already exists')) {
      return { code: HTTP.CONFLICT, message: error.message };
    }

    if (_.startsWith(error.message, 'Unauthorized')) {
      return { code: HTTP.UNAUTHORIZED, message: error.message };
    }

    if (_.startsWith(error.message, 'Unverified')) {
      return { code: HTTP.UNAUTHORIZED, message: error.message };
    }

    // Logic errors
    if (_.endsWith(error.message, 'port is already allocated')) {
      return { code: HTTP.CONFLICT, message: 'Port is already allocated' };
    }

    if (_.startsWith(error.message, 'Conflict')) {
      return { code: HTTP.CONFLICT, message: error.message };
    }

    return knownErrors['Unknown Error'];
  }

}
