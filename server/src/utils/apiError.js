/* const HttpStatusCode {
    OK = 200,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    INTERNAL_SERVER = 500,
   } */

class ApiError extends Error {
  constructor(statusCode, messsage = "", stack = "", errors = []) {
    super(messsage);
    this.statusCode = statusCode;
    this.message = messsage;
    this.data = null;
    this.errors = errors;
    if (this.stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this);
    }
  }
}
export default ApiError;
