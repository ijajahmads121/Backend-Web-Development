require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

// Keep one client per process; the global cache also avoids duplicate clients
// when development tooling reloads this module.
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
