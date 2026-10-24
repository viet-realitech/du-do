/* Hand-picked figure portraits on Wikimedia Commons: period photographs or painted portraits, never statues or places.
   [path, x%, y%, zoom]: path is under commons/thumb ('T', a 330px standard-size thumbnail) or the original ('U', files
   narrower than 330px); x/y/zoom frame the face inside a round avatar (object-position + scale about that point).
   Nguyễn Trường Tộ has no freely licensed portrait (the vi.wikipedia one is fair-use only), so he keeps initials. */
export const PORTRAIT: Record<string, [string, number, number, number]> = {
  ntp: ['T0/0c/Portrait_of_Nguy%E1%BB%85n_Tri_Ph%C6%B0%C6%A1ng.webp/330px-Portrait_of_Nguy%E1%BB%85n_Tri_Ph%C6%B0%C6%A1ng.webp', 50, 10, 2.4],
  td: ['T1/19/Truong_Dinh.JPG/330px-Truong_Dinh.JPG', 50, 40, 1.2],
  ptg: ['T7/78/Phan_Thanh_Gian.jpg/330px-Phan_Thanh_Gian.jpg', 52, 16, 2.8],
  hn: ['T2/2c/Vua_H%C3%A0m_Nghi_n%C4%83m_1900.jpg/330px-Vua_H%C3%A0m_Nghi_n%C4%83m_1900.jpg', 55, 20, 1.7],
  pdp: ['Td/dc/Portrait_of_Phan_%C4%90%C3%ACnh_Ph%C3%B9ng.png/330px-Portrait_of_Phan_%C4%90%C3%ACnh_Ph%C3%B9ng.png', 50, 40, 1.5],
  hht: ['Td/d0/%C4%90%E1%BB%81_Th%C3%A1m.jpg/330px-%C4%90%E1%BB%81_Th%C3%A1m.jpg', 46, 5, 3.2],
  pbc: ['Ud/dd/Phan_Boi_Chau.jpg', 50, 40, 1.2],
  pct: ['T2/2d/Phan_Chau_Trinh.jpg/330px-Phan_Chau_Trinh.jpg', 58, 26, 3.2],
  hcm: ['Tf/f7/Ho_Chi_Minh_-_1946_Portrait_%28cropped%29.jpg/330px-Ho_Chi_Minh_-_1946_Portrait_%28cropped%29.jpg', 50, 35, 1.2],
  nth: ['T0/02/Nguy%E1%BB%85n_Th%C3%A1i_H%E1%BB%8Dc.jpg/330px-Nguy%E1%BB%85n_Th%C3%A1i_H%E1%BB%8Dc.jpg', 50, 28, 1.4],
  pq: ['T7/7a/Ph%E1%BA%A1m_Qu%E1%BB%B3nh%2C_Souverains_et_notabilites_d%27Indochine_%28cropped%29.jpg/330px-Ph%E1%BA%A1m_Qu%E1%BB%B3nh%2C_Souverains_et_notabilites_d%27Indochine_%28cropped%29.jpg', 50, 30, 1.5],
  vng: ['Tc/c8/Mr._Vo_Nguyen_Giap_%28cropped%29.jpg/330px-Mr._Vo_Nguyen_Giap_%28cropped%29.jpg', 50, 28, 1.3],
  bd: ['T8/8b/Baodai2.jpg/330px-Baodai2.jpg', 50, 28, 1.4],
  ttk: ['T5/59/Mr._Tran_Trong_Kim.jpg/330px-Mr._Tran_Trong_Kim.jpg', 50, 28, 1.4],
  ndd: ['Ta/a6/President_NGO-DINH-DIEM_of_the_Republic_of_Viet-Nam.jpg/330px-President_NGO-DINH-DIEM_of_the_Republic_of_Viet-Nam.jpg', 50, 28, 1.5],
  dvm: ['Tf/f9/Portrait_of_D%C6%B0%C6%A1ng_V%C4%83n_Minh%2C_Vietnam_Fights_and_Builds_No.1%2C_July_1964.jpg/330px-Portrait_of_D%C6%B0%C6%A1ng_V%C4%83n_Minh%2C_Vietnam_Fights_and_Builds_No.1%2C_July_1964.jpg', 52, 25, 1.4],
  ld: ['Te/e7/Le_duan.png/330px-Le_duan.png', 50, 28, 1.4],
  nvl: ['T8/86/T%C3%A1m_L%C3%AA_Thanh_v%C3%A0_Nguy%E1%BB%85n_V%C4%83n_Linh_%28cropped%29_%282%29.jpg/330px-T%C3%A1m_L%C3%AA_Thanh_v%C3%A0_Nguy%E1%BB%85n_V%C4%83n_Linh_%28cropped%29_%282%29.jpg', 50, 35, 1.3],
  pd: ['T0/0f/Musician_Ph%E1%BA%A1m_Duy_and_singer_Th%C3%A1i_H%E1%BA%B1ng%2C_1949.jpg/330px-Musician_Ph%E1%BA%A1m_Duy_and_singer_Th%C3%A1i_H%E1%BA%B1ng%2C_1949.jpg', 8, 35, 1.4],
  nvt: ['T6/68/Official_Portrait_of_Nguy%E1%BB%85n_V%C4%83n_Thi%E1%BB%87u%2C_President_of_the_Republic_of_Vietnam_%28cropped%29.jpg/330px-Official_Portrait_of_Nguy%E1%BB%85n_V%C4%83n_Thi%E1%BB%87u%2C_President_of_the_Republic_of_Vietnam_%28cropped%29.jpg', 52, 22, 1.8],
  tqd: ['T7/7e/B%E1%BB%93_t%C3%A1t_Th%C3%ADch_Qu%E1%BA%A3ng_%C4%90%E1%BB%A9c.jpg/330px-B%E1%BB%93_t%C3%A1t_Th%C3%ADch_Qu%E1%BA%A3ng_%C4%90%E1%BB%A9c.jpg', 50, 18, 2],
};
