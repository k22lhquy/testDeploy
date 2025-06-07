// const axios = require('axios');  // Thư viện axios để tải ảnh từ URL
// const fs = require('fs'); // Đọc file hệ thống
// const nsfwjs = require('nsfwjs');
// const { createCanvas, loadImage } = require('canvas'); // Thư viện canvas cho Node.js
// const sharp = require('sharp'); // Thư viện sharp để chuyển đổi ảnh

// let nsfwModel;

// (async () => {
//   // Tải mô hình NSFWJS
//   nsfwModel = await nsfwjs.load();
//   console.log("Mô hình NSFWJS đã được tải!");

//   // URL của ảnh từ Cloudinary
//   const imageUrls = [
//     'https://res.cloudinary.com/dg6lkpuvm/image/upload/v1746990292/c4k1f3vmfk1bthskbqrw.webp',
//     'https://res.cloudinary.com/dg6lkpuvm/image/upload/v1746988029/o6agu8zr0jbgjzdjsanh.png',
//     'https://res.cloudinary.com/dg6lkpuvm/image/upload/v1746434506/cqafisslgndyeeldgqgn.jpg',
//   ];

//   // Kiểm tra các ảnh
//   for (const imageUrl of imageUrls) {
//     const isNSFW = await checkImageForInappropriateContent(imageUrl);
//     console.log(isNSFW ? 'Hình ảnh có chứa nội dung NSFW' : 'Hình ảnh an toàn');
//   }
// })();

// const checkImageForInappropriateContent = async (imageUrl) => {
//   try {
//     // Tải hình ảnh từ Cloudinary hoặc bất kỳ URL nào
//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const imageBuffer = Buffer.from(response.data, 'binary');

//     // Kiểm tra định dạng ảnh (WEBP sẽ cần chuyển đổi)
//     const metadata = await sharp(imageBuffer).metadata();

//     let convertedImageBuffer = imageBuffer;

//     // Nếu ảnh là WEBP, chuyển đổi thành PNG hoặc JPEG
//     if (metadata.format === 'webp') {
//       console.log('Chuyển đổi ảnh WEBP...');
//       convertedImageBuffer = await sharp(imageBuffer)
//         .toFormat('png')  // Chuyển đổi thành PNG
//         .toBuffer();
//     }

//     // Tạo canvas từ hình ảnh đã chuyển đổi hoặc gốc
//     const img = await loadImage(convertedImageBuffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     // Phân tích hình ảnh với NSFWJS
//     const predictions = await nsfwModel.classify(canvas);
//     console.log('Predictions:', predictions);

//     // Tìm tỷ lệ xác suất của các lớp NSFW như 'Porn' hoặc 'Sexy'
//     const nsfwScore = predictions.find(pred => pred.className === 'Porn' || pred.className === 'Sexy').probability;

//     // Kiểm tra ngưỡng NSFW
//     return nsfwScore > 0.4; // Ngưỡng đánh giá NSFW (bạn có thể điều chỉnh)
//   } catch (error) {
//     console.error("Lỗi khi kiểm duyệt ảnh:", error.message);
//     return false;
//   }
// };
