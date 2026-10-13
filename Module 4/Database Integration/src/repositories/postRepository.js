const prisma = require('../db/prisma');
const createPostRepository = require('./createPostRepository');

module.exports = createPostRepository(prisma);
