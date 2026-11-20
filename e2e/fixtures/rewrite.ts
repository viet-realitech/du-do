import type { Page } from '@playwright/test';

/** Đổi bản lưu giữa chừng một bài thử rồi mở lại ứng dụng. Không ghi vào localStorage khi ứng dụng còn chạy rồi
    page.reload(): việc lưu hẹn giờ của ván cũ (huy hiệu trao sau màn kết, state.ts save()) có thể chạy giữa lúc ghi và
    lúc trang tải lại, ghi đè bản vừa đặt bằng ván cũ (WebKit hay gặp). Rời sang một tệp tĩnh cùng nguồn trước, ghi, rồi
    mới mở lại '/': không còn mã nào của ván cũ chạy. sessionStorage giữ nguyên, nên init script gieo bản lưu đầu bài
    (đánh dấu 'seeded') không gieo lại. */
export async function rewrite(page: Page, apply: () => void): Promise<void>;
export async function rewrite<A>(page: Page, apply: (a: A) => void, arg: A): Promise<void>;
export async function rewrite<A>(page: Page, apply: (a?: A) => void, arg?: A): Promise<void> {
  await page.goto('/robots.txt');
  await page.evaluate(apply as (a: A | undefined) => void, arg);
  await page.goto('/');
}
