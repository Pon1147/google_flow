/**
 * Trích xuất và parse JSON từ nội dung trả về của AI.
 * Xử lý được các trường hợp AI trả về text bao quanh hoặc block markdown.
 * Đã bổ sung xử lý dấu phẩy thừa (trailing commas) và làm sạch text.
 */
export function extractJson<T>(text: string): T | null {
  if (!text) return null;

  try {
    // 1. Loại bỏ các block markdown nếu có
    let jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // 2. Tìm vị trí thực sự của object JSON {}
    const startIdx = jsonStr.indexOf('{');
    const endIdx = jsonStr.lastIndexOf('}');
    
    if (startIdx === -1 || endIdx === -1) {
      // Nếu không tìm thấy {}, có thể là array []
      const arrStart = jsonStr.indexOf('[');
      const arrEnd = jsonStr.lastIndexOf(']');
      if (arrStart !== -1 && arrEnd !== -1) {
        jsonStr = jsonStr.substring(arrStart, arrEnd + 1);
      } else {
        return null;
      }
    } else {
      jsonStr = jsonStr.substring(startIdx, endIdx + 1);
    }
    
    // 3. Làm sạch JSON: xóa dấu phẩy thừa trước dấu đóng ngoặc và ký tự điều khiển ẩn (giữ lại \t, \n, \r)
    const cleaned = jsonStr
      .replace(/,\s*([\]}])/g, '$1') // Xóa trailing commas
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ""); // Xóa ký tự điều khiển ẩn trừ \t, \n, \r

    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.error("JSON Extraction Error:", e, "\nOriginal Text:", text);
    return null;
  }
}
