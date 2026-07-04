require('../config/env');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAccessToken, verifyAccessToken } = require('../utils/jwt');

const testUtils = async () => {

  const hash = await hashPassword('TestPassword123');
  console.log('Hashed password:', hash.substring(0, 30) + '...');
  
  const isMatch = await comparePassword('TestPassword123', hash);
  console.log('Password match:', isMatch);


  const token = generateAccessToken({ id: 1, email: 'test@test.com', role: 'client' });
  console.log('Access token:', token.substring(0, 50) + '...');
  
  const decoded = verifyAccessToken(token);
  console.log('Decoded token:', decoded);

  process.exit(0);
};

testUtils();