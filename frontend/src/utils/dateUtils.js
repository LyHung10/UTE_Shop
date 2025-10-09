// utils/dateUtils.js
// export const formatVietnamDateTime = (utcTime) => {
//   if (!utcTime) return '';
  
//   // Tạo date object từ time (đang bị hiểu nhầm là UTC)
//   const date = new Date(utcTime);
  
//   // Trừ 7 tiếng để convert từ "UTC hiểu nhầm" về Vietnam time thực tế
//   const vietnamTime = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
//   return vietnamTime.toLocaleString('vi-VN', {
//     day: '2-digit',
//     month: '2-digit', 
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// export const formatVietnamTime = (utcTime) => {
//   if (!utcTime) return '';
  
//   const date = new Date(utcTime);
//   const vietnamTime = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
//   return vietnamTime.toLocaleTimeString('vi-VN', {
//     hour: '2-digit',
//     minute: '2-digit'
//   });
// };

// export const formatVietnamDate = (utcTime) => {
//   if (!utcTime) return '';
  
//   const date = new Date(utcTime);
//   const vietnamTime = new Date(date.getTime() - (7 * 60 * 60 * 1000));
  
//   return vietnamTime.toLocaleDateString('vi-VN', {
//     day: '2-digit',
//     month: '2-digit',
//     year: 'numeric'
//   });
// };


// utils/dateUtils.js
export const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh', // Force Vietnam timezone
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};

export const isFlashSaleActive = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return now >= start && now <= end;
};

export const isFlashSaleUpcoming = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    
    return now < start;
};