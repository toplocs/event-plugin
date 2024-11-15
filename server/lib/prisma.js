const { PrismaClient } = require('@prisma/client');

global.prisma = global.prisma || new PrismaClient({
  //log: ['query', 'info', 'warn', 'error']
});

const prisma = global.prisma;

if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

module.exports = prisma;
