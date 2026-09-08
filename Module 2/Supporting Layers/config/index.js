// This is the only module that reads from process.env.
module.exports = {
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  maxArticles: Number.parseInt(process.env.MAX_ARTICLES, 10) || 50,
};
