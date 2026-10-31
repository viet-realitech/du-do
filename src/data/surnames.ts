/* Chế độ Chơi: họ của dòng họ có ý nghĩa. Gia phả mở đầu cho các họ phổ biến, dòng biên niên cho từng hướng ở
   điểm rẽ, các "dấu ấn dòng họ" ở kết cục và lời khép theo họ. Nội dung do đội soạn và kiểm chứng với Wikipedia
   tiếng Việt (10.2026); xem docs/figures-review.md cho phần nhân vật cùng họ. */

export interface SurnameLore {
  /** Khoá ascii (nguyen, tran, hoang…). */
  key: string;
  /** Các cách viết: ['Hoàng', 'Huỳnh']. */
  names: string[];
  /** Hai câu gia phả mở đầu. */
  lore: string;
  /** Biến thể vùng miền / kỵ huý, hoặc ''. */
  variant: string;
  /** Nhân vật trong hồ sơ mang họ này (id FIG). */
  kin: string[];
  /** Biến cố riêng trong trò chơi áp dụng cho họ này: south-spelling · ngo-1963 · royal-1945 · mac-lore · none. */
  hooks: string[];
}

export const SURNAMES: SurnameLore[] = [];

const norm = (s: string) => s.replace(/^họ\s+/i, '').trim().toLowerCase();
/** Khoá họ từ tên người chơi gõ ("Họ Huỳnh" → hoang); '' khi không nhận ra. */
export const surnameKey = (name: string): string => {
  const n = norm(name);
  return SURNAMES.find(s => s.names.some(x => x.toLowerCase() === n))?.key || '';
};
export const loreOf = (key: string): SurnameLore | undefined => SURNAMES.find(s => s.key === key);
/** Tên hiển thị chuẩn: "Họ X". */
export const asFamily = (name: string): string => { const n = name.replace(/^họ\s+/i, '').trim(); return n ? 'Họ ' + n[0].toUpperCase() + n.slice(1) : ''; };

/** Dòng biên niên (gia phả cuối trò chơi) cho mỗi hướng ở điểm rẽ: id hướng → câu quá khứ. */
export const CHRONICLE: Record<string, string> = {};

/** Dấu ấn dòng họ ở kết cục; luật chọn nằm ở play.ts (lineage). */
export interface Archetype { id: string; title: string; text: string }
export const ARCHETYPES: Archetype[] = [];

/** Lời khép theo họ ở kết cục: khoá họ → một câu. */
export const EPILOGUES: Record<string, string> = {};

/** Mô tả ngắn các biến cố riêng, cho gia phả mở đầu. */
export const HOOK_TEXT: Record<string, string> = {
  'south-spelling': 'Nếu di cư vào Nam năm 1954, dòng họ sẽ đứng trước cách viết họ của người miền Nam.',
  'ngo-1963': 'Sau đảo chính tháng 11.1963, một gia đình họ Ngô sẽ bị dò hỏi có bà con với nhà Ngô Đình hay không.',
  'royal-1945': 'Mùa thu 1945, dòng dõi hoàng tộc phải chọn giữ hay bỏ tên dòng.',
  'mac-lore': 'Tổ tiên họ Mạc từng đổi họ để tránh truy bức sau năm 1592; dòng họ bạn mang ký ức ấy.',
};
