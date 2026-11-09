
export const validateEnv = () => {
  const requiredVariables = ["JWT_SECRET"];

  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]?.trim()
  );

  if (!process.env.DATABASE_URL) {
    const localDatabaseVariables = [
      "DB_HOST",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
    ];

    for (const variable of localDatabaseVariables) {
      if (!process.env[variable]?.trim()) {
        missingVariables.push(variable);
      }
    }
  }

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must contain at least 32 characters.");
  }

  const databasePort = Number(process.env.DB_PORT || 5432);

  if (
    !process.env.DATABASE_URL &&
    (!Number.isInteger(databasePort) ||
      databasePort < 1 ||
      databasePort > 65535)
  ) {
    throw new Error("DB_PORT must be a valid port number.");
  }
};
