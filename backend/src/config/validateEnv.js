const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];

export function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v] || String(process.env[v]).trim() === '');
  if (missing.length) {
    const error = new Error(`Missing required env vars: ${missing.join(', ')}`);
    error.code = 'ENV_VALIDATION_ERROR';
    throw error;
  }
}


