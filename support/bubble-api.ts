import { env } from './env';

export interface BubbleRecord {
  _id: string;
  'Created Date'?: string;
  'Modified Date'?: string;
  [key: string]: unknown;
}

export interface BubbleListResult<T extends BubbleRecord = BubbleRecord> {
  results: T[];
  cursor: number;
  count: number;
  remaining: number;
}

export interface ListOptions {
  limit?: number;
  cursor?: number;
  sortField?: string;
  descending?: boolean;
  constraints?: Array<Record<string, unknown>>;
}

export class BubbleApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = 'BubbleApiError';
  }
}

/**
 * Minimal Bubble Data API client.
 *
 * Endpoints are rooted at BASE_URL, which already contains the environment
 * segment, e.g. https://app.bubbleapps.io/version-test or /version-<branch>.
 */
export class BubbleApi {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl = env.baseUrl, token = env.apiToken) {
    if (!token) {
      throw new Error('BUBBLE_API_TOKEN is not set. See .env.example.');
    }
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.token = token;
  }

  private endpoint(type: string, id?: string): string {
    const typeSegment = encodeURIComponent(type);
    const idSegment = id ? `/${encodeURIComponent(id)}` : '';
    return `${this.baseUrl}/api/1.1/obj/${typeSegment}${idSegment}`;
  }

  private async request<T>(method: string, url: string, body?: unknown): Promise<T> {
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new BubbleApiError(
        `${method} ${url} failed with ${response.status} ${response.statusText}`,
        response.status,
        text,
      );
    }
    return (text ? JSON.parse(text) : {}) as T;
  }

  async list<T extends BubbleRecord = BubbleRecord>(
    type: string,
    options: ListOptions = {},
  ): Promise<BubbleListResult<T>> {
    const params = new URLSearchParams();
    if (options.limit !== undefined) params.set('limit', String(options.limit));
    if (options.cursor !== undefined) params.set('cursor', String(options.cursor));
    if (options.sortField) params.set('sort_field', options.sortField);
    if (options.descending !== undefined) params.set('descending', String(options.descending));
    if (options.constraints) params.set('constraints', JSON.stringify(options.constraints));

    const query = params.toString();
    const url = `${this.endpoint(type)}${query ? `?${query}` : ''}`;
    const result = await this.request<{ response: BubbleListResult<T> }>('GET', url);
    return result.response;
  }

  async get<T extends BubbleRecord = BubbleRecord>(type: string, id: string): Promise<T> {
    const result = await this.request<{ response: T }>('GET', this.endpoint(type, id));
    return result.response;
  }

  async create(type: string, data: Record<string, unknown>): Promise<string> {
    const result = await this.request<{
      id?: string;
      _id?: string;
      response?: { id?: string; _id?: string };
    }>('POST', this.endpoint(type), data);

    const id = result.id ?? result._id ?? result.response?.id ?? result.response?._id;
    if (!id) {
      throw new Error(`Bubble did not return an id when creating "${type}": ${JSON.stringify(result)}`);
    }
    return id;
  }

  async update(type: string, id: string, data: Record<string, unknown>): Promise<void> {
    await this.request<unknown>('PATCH', this.endpoint(type, id), data);
  }

  async remove(type: string, id: string): Promise<void> {
    await this.request<unknown>('DELETE', this.endpoint(type, id));
  }
}
