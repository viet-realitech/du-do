/* Cảnh động cho các trận đánh trong tour chương: loại cảnh, mũi tiến quân (từ → tới, bên), vị trí phòng thủ.
   Toạ độ [kinh độ, vĩ độ]. Dữ liệu do đội soạn và kiểm chứng với Wikipedia (11.2026); là minh hoạ hướng tiến quân,
   không phải bản đồ tác chiến. */

export type SceneType = 'land' | 'siege' | 'naval' | 'air' | 'uprising' | 'landing';
export type LonLat = [number, number];
/** [từ, tới, bên, ghi chú] */
export type Arrow = [LonLat, LonLat, string, string];
export interface Scene {
  type: SceneType;
  arrows: Arrow[];
  /** Vị trí được giữ: [kinh độ, vĩ độ, bên]. */
  hold: [number, number, string][];
}

/** Màu mũi tên theo bên (sáng, đọc được trên mọi màu lãnh thổ; luôn có viền tối). */
export const SIDE_COLOR: Record<string, string> = {
  dainam: '#f2c443', phap: '#5b8ef0', es: '#e9a23b', cd: '#c3cad4', jp: '#ff6159', th: '#7fb0ff',
  vndcch: '#ff4b3e', cmlt: '#ff7d6b', vnch: '#ffd84a', bx: '#c58ae6', my: '#4fa3ff', kh: '#d0615c', cn: '#ff8a3d', nghiaquan: '#ffa04a',
};
export const SIDE_NAME: Record<string, string> = {
  dainam: 'Quân triều Nguyễn', phap: 'Quân Pháp', es: 'Quân Tây Ban Nha', cd: 'Quân Cờ Đen', jp: 'Quân Nhật', th: 'Quân Thái Lan',
  vndcch: 'Việt Minh / QĐND', cmlt: 'Quân Giải phóng', vnch: 'Quân đội VNCH', bx: 'Bình Xuyên', my: 'Quân Mỹ', kh: 'Khmer Đỏ',
  cn: 'Quân Trung Quốc', nghiaquan: 'Nghĩa quân',
};

export const SCENES: Record<string, Scene> = {};
