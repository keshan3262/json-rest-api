const { config } = require('dotenv');
const path = require('path');

const { logger } = require('./utils/logger');

logger.info('Applying .env configuration');
config({ path: path.join(__dirname, process.env.NODE_ENV === 'testing' ? '../.env.test' : '../.env') });
