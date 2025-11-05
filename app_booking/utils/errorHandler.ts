/**
 * Sanitizes error messages to make them user-friendly
 * Removes technical details like "AxiosError", "Request failed", etc.
 */
export const sanitizeErrorMessage = (error: any): string => {
  // Priority 1: For authentication errors (401, 403), always use friendly message
  // This ensures login errors are never technical
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return getFriendlyErrorMessage(error.response.status);
  }

  // Priority 2: Use userMessage from axios interceptor (already sanitized)
  if (error?.userMessage && typeof error.userMessage === 'string') {
    // Double check to ensure it's not technical
    const cleaned = cleanMessage(error.userMessage);
    if (cleaned && !isTechnicalMessage(cleaned)) {
      return cleaned;
    }
    // If still technical, continue to next priority
  }

  // Priority 3: Check error.response.status and provide friendly messages
  if (error?.response?.status) {
    return getFriendlyErrorMessage(error.response.status);
  }

  // Priority 4: Use server response message (only if not technical)
  // Check multiple possible locations for error message
  const serverMessage = error?.response?.data?.errors?.message || 
                        error?.response?.data?.message || 
                        error?.response?.data?.error;
  if (serverMessage && typeof serverMessage === 'string') {
    // Clean up server message if it contains technical details
    const cleaned = cleanMessage(serverMessage);
    if (cleaned && !isTechnicalMessage(cleaned)) {
      return cleaned;
    }
  }

  // Priority 5: Check if error.message contains technical details
  if (error?.message && typeof error.message === 'string') {
    const cleaned = cleanMessage(error.message);
    // If the cleaned message is still technical, use generic message
    if (cleaned && !isTechnicalMessage(cleaned)) {
      return cleaned;
    }
  }

  // Priority 6: Generic fallback
  return getGenericErrorMessage(error);
};

/**
 * Cleans technical terms from error messages
 */
const cleanMessage = (message: string): string => {
  if (!message || typeof message !== 'string') {
    return '';
  }

  // Remove common technical prefixes and patterns
  let cleaned = message
    .replace(/^(AxiosError|Error|TypeError|NetworkError|Request failed):\s*/i, '')
    .replace(/Request failed with status code \d+/i, '')
    .replace(/Network request failed/i, '')
    .replace(/timeout of \d+ms exceeded/i, '')
    .replace(/AxiosError:\s*/gi, '')
    .replace(/\[.*?AxiosError.*?\]/gi, '')
    .replace(/Request failed with status code/gi, '')
    .replace(/status code \d+/gi, '')
    .replace(/ECONNREFUSED|ENOTFOUND|ETIMEDOUT/gi, '')
    .trim();

  // Remove any remaining technical patterns
  if (cleaned.toLowerCase().includes('axioserror') || 
      cleaned.toLowerCase().includes('request failed') ||
      cleaned.match(/status code \d+/i)) {
    return '';
  }

  // If message is empty or too short, return empty
  if (!cleaned || cleaned.length < 3) {
    return '';
  }

  return cleaned;
};

/**
 * Checks if message contains technical details
 */
const isTechnicalMessage = (message: string): boolean => {
  if (!message || typeof message !== 'string') {
    return true;
  }

  const technicalTerms = [
    'axioserror',
    'request failed',
    'status code',
    'network error',
    'timeout',
    'econnrefused',
    'enotfound',
    'err_',
    'axios',
    'error:',
    'failed with',
    'http',
    'ecode',
    'econn',
    'etimedout',
  ];

  const lowerMessage = message.toLowerCase().trim();
  
  // Check if message starts with technical terms
  if (technicalTerms.some((term) => lowerMessage.startsWith(term))) {
    return true;
  }
  
  // Check if message contains technical patterns
  if (technicalTerms.some((term) => lowerMessage.includes(term))) {
    return true;
  }

  // Check for patterns like "Error: ..." or "AxiosError: ..."
  if (/^(error|axioserror|typeerror|networkerror):/i.test(lowerMessage)) {
    return true;
  }

  // Check for status code patterns
  if (/\d{3}\s*(error|failed|code)/i.test(lowerMessage)) {
    return true;
  }

  return false;
};

/**
 * Gets friendly error message based on HTTP status code
 */
const getFriendlyErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    case 401:
      return 'Tên đăng nhập hoặc mật khẩu không đúng.';
    case 403:
      return 'Bạn không có quyền truy cập.';
    case 404:
      return 'Không tìm thấy tài nguyên.';
    case 422:
      return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
    case 500:
      return 'Lỗi máy chủ. Vui lòng thử lại sau.';
    case 503:
      return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
};

/**
 * Gets generic error message based on error type
 */
const getGenericErrorMessage = (error: any): string => {
  // Check if it's a network error
  if (error?.request && !error?.response) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet.';
  }

  // Check if it's a timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Kết nối quá lâu. Vui lòng thử lại.';
  }

  // Generic message
  return 'Đã xảy ra lỗi. Vui lòng thử lại.';
};
