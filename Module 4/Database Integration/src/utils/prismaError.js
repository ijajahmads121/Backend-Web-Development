function publicError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function translatePrismaError(error) {
  switch (error && error.code) {
    case 'P2002':
      return publicError('A record with these values already exists', 409);
    case 'P2003':
    case 'P2014':
      return publicError('A referenced record does not exist or cannot be removed', 422);
    case 'P1000':
    case 'P1001':
    case 'P1002':
    case 'P1017':
      return publicError('The database is temporarily unavailable', 503);
    default:
      return error;
  }
}

module.exports = { translatePrismaError };
