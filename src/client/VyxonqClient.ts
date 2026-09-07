export interface VyxonqHealth {
  status: string;
  activeJobs: number;
  uptime: number;
  timestamp: string;
}

export interface VyxonqStats {
  totalRequests: number;
  minified: number;
  beautified: number;
  compressed: number;
}

export interface VyxonqStatus extends VyxonqHealth {
  version: string;
  maxFileSizeMB: number;
  stats: VyxonqStats;
}

export interface ApplyResult {
  code: string;
  duration: number;
}

export interface CompressResult {
  code: string;
  duration: number;
}

export class VyxonqAPI {
  private readonly apiUrl: string;
  private readonly timeout: number;

  constructor(apiUrl: string, timeout: number = 1_200_000) {
    if (!apiUrl) throw new Error("apiUrl required");
    this.apiUrl = apiUrl.replace(/\/$/, "");
    this.timeout = timeout;
  }

  async health(): Promise<VyxonqHealth> {
    return this.request<VyxonqHealth>("/health", "GET");
  }

  async status(): Promise<VyxonqStatus> {
    return this.request<VyxonqStatus>("/v1/status", "GET");
  }

  async apply(code: string, mode: string = "Minify"): Promise<ApplyResult> {
    if (!code || typeof code !== "string") throw new Error("Code required");

    const start = Date.now();
    const response = await this.request<{ success: boolean; code: string; error?: string }>(
      "/v1/apply",
      "POST",
      { code, mode }
    );
    const duration = Date.now() - start;

    if (!response.success) throw new Error(response.error || "Apply failed");

    return { code: response.code, duration };
  }

  // Compiles/compresses code through the VM compressor (/v1/apply/vm).
  // Unlike apply(), this has no "mode" - it always runs the VM compression pass.
  async compress(code: string): Promise<CompressResult> {
    if (!code || typeof code !== "string") throw new Error("Code required");

    const start = Date.now();
    const response = await this.request<{ success: boolean; code: string; error?: string }>(
      "/v1/apply/vm",
      "POST",
      { code }
    );
    const duration = Date.now() - start;

    if (!response.success) throw new Error(response.error || "Compression failed");

    return { code: response.code, duration };
  }

  private async request<T>(endpoint: string, method: string, body: unknown = null): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error((data as { error?: string }).error || `HTTP ${response.status}`);
      return data as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Timeout after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
