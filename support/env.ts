function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}. Copy .env.example to .env and fill it in.`);
  }
  return value;
}

export const env = {
  get baseUrl(): string {
    return requireEnv('BASE_URL').replace(/\/+$/, '');
  },
  get loginPath(): string {
    return process.env.LOGIN_PATH?.trim() || '/login_page';
  },
  get userEmail(): string {
    return requireEnv('TEST_USER_EMAIL');
  },
  get userPassword(): string {
    return requireEnv('TEST_USER_PASSWORD');
  },
  get apiToken(): string {
    return process.env.BUBBLE_API_TOKEN?.trim() ?? '';
  },
  get testType(): string {
    return process.env.BUBBLE_TEST_TYPE?.trim() ?? '';
  },
  get testFields(): Record<string, unknown> | undefined {
    const raw = process.env.BUBBLE_TEST_FIELDS?.trim();
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      throw new Error('BUBBLE_TEST_FIELDS must be valid JSON, e.g. {"Name":"QA record"}');
    }
  },
  get hasApiAccess(): boolean {
    return Boolean(this.apiToken && this.testType);
  },
};
