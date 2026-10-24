/* Recorded voice-over clips bundled from src/voice/*.m4a (only files that exist). */
const REC = import.meta.glob('./voice/*.m4a', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

export const recording = (key?: string): string | undefined => (key ? REC[`./voice/${key}.m4a`] : undefined);
