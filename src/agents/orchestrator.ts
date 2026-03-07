import type { ScanResult } from '../types';
import { downsampleImage } from '../utils/image';
import { logAgentDecision } from '../utils/logger';

export async function runScan(imageBlob: Blob, sessionId: string): Promise<ScanResult> {
  logAgentDecision({ agent: 'orchestrator', inputSummary: `sessionId=${sessionId}`, outcome: 'starting scan' });
  const start = Date.now();

  const { base64, mediaType } = await downsampleImage(imageBlob);

  const response = await fetch('/api/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, imageMediaType: mediaType, sessionId }),
  });

  if (!response.ok) {
    const err = await response.text();
    logAgentDecision({ agent: 'orchestrator', inputSummary: `sessionId=${sessionId}`, outcome: `ERROR: ${err}` });
    throw new Error(`Scan API error: ${err}`);
  }

  const result = (await response.json()) as ScanResult;
  logAgentDecision({ agent: 'orchestrator', inputSummary: `sessionId=${sessionId}`, outcome: `complete: ${result.books.length} books in ${Date.now() - start}ms` });
  return result;
}
