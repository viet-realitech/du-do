import type { Fx } from './cards';

/* Chế độ Chơi: biến cố riêng của dòng họ, gắn vào một sự kiện có sẵn và chỉ hiện khi điều kiện đúng (họ, phe đang theo,
   hướng đã chọn, quê quán, mức bạc). Khác thẻ thường, biến cố riêng có thể đổi họ của dòng họ ('mother' = lấy họ mẹ do
   người chơi chọn, hoặc một cách viết mới như 'Huỳnh'). Số liệu là ước lệ của trò chơi. */

export interface SpecialWhen {
  /** Khoá họ (surnames.ts). */
  surnames?: string[];
  /** Phe đang theo (CAMP ở play.ts): tr · pt · vm · qg · ph · nn · my · lg. */
  camps?: string[];
  /** Hướng đã chọn ở điểm rẽ của chương đó. */
  picks?: string[];
  /** Bạc tối thiểu. */
  minB?: number;
  /** Quê quán (HOMES). */
  homes?: string[];
}
/** [nhãn, mô tả, hiệu ứng, kết cục, đổi họ?] */
export type SpecialChoice = [string, string, Fx, string, string?];
export interface SpecialCard {
  id: string;
  /** id sự kiện gắn vào. */
  ev: string;
  when: SpecialWhen;
  title: string;
  /** Một câu đặt vấn đề, nói với dòng họ. */
  s: string;
  choices: SpecialChoice[];
  /** Ghi chú sử liệu cho phiếu rà soát. */
  note: string;
}

export const SPECIAL: SpecialCard[] = [];
