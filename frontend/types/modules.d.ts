declare module "unpdf" {
  interface ExtractTextResult {
    totalPages: number;
    text: string[];
  }
  export function extractText(
    data: Uint8Array,
    options?: Record<string, unknown>,
  ): Promise<ExtractTextResult>;
}
