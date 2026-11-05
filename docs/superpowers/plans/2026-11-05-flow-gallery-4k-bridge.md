# Native Flow Gallery Bridge (4K Upscale Workflow) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai tính năng "Native Flow Gallery Bridge" (Option 2), cho phép người dùng định danh (track-back) ảnh phân cảnh trong Media Gallery của Google Flow, được hướng dẫn thao tác kích hoạt model upscale 4K gốc của Google (`GEM_PIX_2_UPSAMPLE_4K`), và nạp ngược lại (pull) bản 4K đã upscale vào Storyboard chỉ với 1 click.

**Architecture:**

- Mọi ảnh do `Flow.generate.image` tạo ra đều trả về `mediaId` và được Google Flow tự động lưu trong Gallery của dự án.
- Tool sẽ lưu trữ metadata này trong `Shot.renderedImage` và hiển thị UI trạng thái `Synced to Gallery`.
- Cung cấp Modal hướng dẫn Upscale 4K kèm tính năng copy `mediaId` / tên ảnh.
- Cung cấp nút `Load 4K from Gallery` sử dụng `Flow.media.select({ filter: 'image' })` để người dùng chọn bản `_upsampled` vừa tạo trong Gallery và cập nhật tức thì vào ShotCard.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Google Flow SDK (`flow-sdk`), Lucide/Material Symbols.

**Spec:** Option 2 được khách hàng lựa chọn: Tận dụng trực tiếp model upscale 4K native của Google Flow thông qua cơ chế Media Gallery Bridge và Track-back asset ID.

## Global Constraints

- Tuân thủ sandbox iframe của Google Flow: Không gọi trực tiếp các API chưa mở trong whitelist IPC.
- Giữ nguyên cấu trúc dữ liệu hiện tại của `Shot` và `AppState` để tương thích ngược 100%.
- Không thêm package ngoài, sử dụng triệt để `flow-sdk` có sẵn.

## Review Focus

1. **Track-back ID:** Khi ảnh được tạo lại (regenerate), `mediaId` mới phải ghi đè chính xác, không giữ ID cũ.
2. **Gallery Sync State:** Phân biệt rõ giữa ảnh gốc 2K và ảnh đã nạp bản 4K (`is4kUpscaled: true`).
3. **Flow Media Select:** Người dùng có thể huỷ (cancel) modal chọn ảnh mà không làm mất ảnh 2K hiện tại.
4. **Export Integrity:** Khi xuất CSV/Storyboard Grid, hệ thống ghi nhận trạng thái 4K của từng cảnh.
5. **i18n:** Toàn bộ text hướng dẫn và nút bấm phải được dịch đầy đủ cho cả 7 ngôn ngữ.

---

### Task 1: Mở rộng Type Definitions & i18n

**Files:**

- Modify: `types.ts`
- Modify: `lib/i18n.ts`

**Interfaces:**

- `Shot.renderedImage`: Thêm trường `is4k?: boolean`, `originalMediaId?: string`.
- `translations`: Thêm các từ khóa `upscale4k`, `upscaleGuide`, `copyMediaId`, `copied`, `load4kFromGallery`, `is4kBadge`, `galleryGuideTitle`, `galleryGuideStep1`, `galleryGuideStep2`, `galleryGuideStep3`.

- [ ] **Step 1: Cập nhật `types.ts` để bổ sung metadata 4K**
- [ ] **Step 2: Cập nhật từ điển dịch thuật trong `lib/i18n.ts`**
- [ ] **Step 3: Chạy `npm run typecheck` xác nhận không có lỗi kiểu dữ liệu**
- [ ] **Step 4: Commit** `feat(types): add 4k upscale metadata and translations`

---

### Task 2: Xây dựng Component `GalleryUpscaleModal`

**Files:**

- Create: `components/GalleryUpscaleModal.tsx`

**Interfaces:**

- Props: `isOpen: boolean`, `shotIndex: number`, `shot: Shot`, `onClose: () => void`, `onSelect4k: () => Promise<void>`, `lang: Language`.
- Displays: Thumbnail, `mediaId`, Hướng dẫn 3 bước thao tác trên Google Flow Gallery, nút `Copy ID` và nút `Pick Upscaled 4K from Gallery`.

- [ ] **Step 1: Viết component `GalleryUpscaleModal.tsx`**
- [ ] **Step 2: Thêm logic copy `mediaId` vào clipboard với visual feedback (Copied!)**
- [ ] **Step 3: Thêm logic gọi `onSelect4k` kích hoạt `Flow.media.select`**
- [ ] **Step 4: Chạy `npm run typecheck`**
- [ ] **Step 5: Commit** `feat(components): create GalleryUpscaleModal for 4k bridge`

---

### Task 3: Tích hợp vào `ShotCard` & `ProductionWorkspace`

**Files:**

- Modify: `components/ShotCard.tsx`
- Modify: `components/ProductionWorkspace.tsx`

**Interfaces:**

- `ShotCard`: Hiển thị Badge `4K Ultra HD` (khi `shot.renderedImage?.is4k`) hoặc nút `Upscale 4K (Flow)` mở modal.
- `ProductionWorkspace`: Cung cấp hàm handler `handleSelect4kShot(shotId: string)`.

- [ ] **Step 1: Cập nhật `ShotCard.tsx` hiển thị badge 4K và trigger mở modal**
- [ ] **Step 2: Thêm hàm `handleSelect4kShot` trong `ProductionWorkspace.tsx` gọi `Flow.media.select({ filter: 'image' })`**
- [ ] **Step 3: Kiểm tra nếu tên file hoặc người dùng chọn ảnh mới, đánh dấu `is4k: true`**
- [ ] **Step 4: Chạy `npm run typecheck`**
- [ ] **Step 5: Commit** `feat(workspace): integrate 4k gallery bridge actions into ShotCard`

---

### Task 4: Double Check, Debug & Test Cases (TCs)

**Files:**

- Test file: `tests/gallery-bridge.test.ts` (hoặc mock script kiểm tra)

**Test Cases (TCs):**

- **TC-01 (Track-back):** Sau khi `Flow.generate.image` sinh ảnh, `shot.renderedImage.mediaId` tồn tại và khớp với Gallery asset ID.
- **TC-02 (Copy Media ID):** Bấm nút Copy Media ID lưu đúng chuỗi vào clipboard.
- **TC-03 (Pick 4K Success):** Người dùng chọn ảnh `_upsampled` từ Gallery, ShotCard cập nhật hiển thị badge `4K Ultra HD` và ảnh nét hơn.
- **TC-04 (Pick 4K Cancel):** Người dùng bấm cancel trong modal `Flow.media.select`, ảnh 2K hiện tại không bị null hoặc biến mất.
- **TC-05 (Regenerate Reset):** Khi người dùng bấm tạo lại ảnh (Regenerate), trạng thái `is4k` được reset về `false` cho đến khi upscale lại.
- **TC-06 (Export Integrity):** Xuất Storyboard Grid và CSV vẫn hoạt động mượt mà với cả ảnh 2K và ảnh 4K.

- [ ] **Step 1: Chạy verify `npm run typecheck` toàn dự án**
- [ ] **Step 2: Tạo mock test script kiểm tra flow dữ liệu của `handleSelect4kShot`**
- [ ] **Step 3: Push commit lên branch `developer`**
