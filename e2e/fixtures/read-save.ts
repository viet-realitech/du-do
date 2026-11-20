/* Đọc từng bản lưu bằng readSave() (src/state.ts) trong node, cho e2e/save-shapes.spec.ts (trình chạy thử của Playwright
   không nạp được dữ liệu JSON của ứng dụng, tsx thì được). Vào (stdin): JSON [[chuỗi bản lưu | null, 'read' | 'play'], …].
   Ra (stdout): JSON { SAVE_V, VARIANT, out: [Loaded, …] }. */
import { readFileSync } from 'node:fs';

const store: Record<string, string> = {};
(globalThis as unknown as { localStorage: unknown }).localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; }, removeItem: (k: string) => { delete store[k]; }, key: () => null, length: 0 };

// chuỗi đường dẫn không phải hằng: tsc của e2e (tsconfig.node.json) không kéo mã ứng dụng vào
const app = '../../src/';
const { readSave, SAVE_V } = await import(app + 'state') as { readSave: (t: string | null, m: string) => unknown; SAVE_V: number };
const { VARIANT } = await import(app + 'data/cards') as { VARIANT: Record<string, unknown> };
const inputs = JSON.parse(readFileSync(0, 'utf8')) as [string | null, 'read' | 'play'][];
process.stdout.write(JSON.stringify({ SAVE_V, VARIANT: Object.keys(VARIANT), out: inputs.map(([t, m]) => readSave(t, m)) }));
