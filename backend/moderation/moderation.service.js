// // moderation.service.js

// import axios from 'axios';
// import * as nsfwjs from 'nsfwjs';
// import { createCanvas, loadImage } from 'canvas';
// import { Buffer as NodeBuffer } from 'node:buffer'; // ✅ đổi tên tránh trùng

import FlaggedContent from './FlaggedContent.js';
import Notification from '../models/notification.model.js';
// import User from '../models/user.model.js';
// import { getReceiverSocketId, io } from '../lib/socket.js';
import sensitiveWords from './sensitiveWords.js';

// // Nếu cần gán Buffer vào globalThis (hiếm khi cần):
// if (typeof globalThis.Buffer === 'undefined') {
//   globalThis.Buffer = NodeBuffer;
// }

// let nsfwModel;
// (async () => {
//   nsfwModel = await nsfwjs.load();
//   console.log("✅ Mô hình NSFWJS đã được tải!");
// })();

// export const checkImageForInappropriateContent = async (imageUrl) => {
//   try {
//     if (!nsfwModel) {
//       console.warn("⚠️ NSFW model chưa sẵn sàng!");
//       return false;
//     }

//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const imageBuffer = NodeBuffer.from(response.data, 'binary');

//     const img = await loadImage(imageBuffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     const predictions = await nsfwModel.classify(canvas);
//     console.log('🔍 Predictions:', predictions);

//     const porn = predictions.find(p => p.className === 'Porn')?.probability || 0;
//     const sexy = predictions.find(p => p.className === 'Sexy')?.probability || 0;
//     const hentai = predictions.find(p => p.className === 'Hentai')?.probability || 0;
//     const drawing = predictions.find(p => p.className === 'Drawing')?.probability || 0;

//     return (porn > 0.4 || sexy > 0.4 || hentai > 0.4 || drawing > 0.7);
//   } catch (error) {
//     console.error("❌ Lỗi kiểm duyệt ảnh:", error.message);
//     return false;
//   }
// };

export const notifyAdmins = async (message, fromUserId) => {
  try {
    await Notification.create({
      from: userId,
      to: null,
      post: postId,
      type: "moderation",
      reason: message,
    });
  } catch (err) {
    console.error("❌ Gửi thông báo lỗi:", err);
  }
};

// export const moderatePostContent = async (post) => {
//   const reasons = [];

//   const allBadWords = [
//     ...sensitiveWords.vulgar,
//     ...sensitiveWords.privacy,
//     ...sensitiveWords.racist,
//     ...sensitiveWords.sexist,
//     ...sensitiveWords.suicide,
//   ];

//   if (post.text) {
//     const text = post.text.toLowerCase();
//     const detectedWords = allBadWords.filter(word => text.includes(word.toLowerCase()));
//     if (detectedWords.length > 0) {
//       reasons.push(`Inappropriate text: ${detectedWords.join(', ')}`);
//     }
//   }

//   if (post.image) {
//     const response = await axios.get(post.image, { responseType: 'arraybuffer' });
//     const imageBuffer = NodeBuffer.from(response.data, 'binary');
//     const img = await loadImage(imageBuffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     const predictions = await nsfwModel.classify(canvas);
//     const reasonsMap = {
//       'Porn': 0.4,
//       'Sexy': 0.4,
//       'Hentai': 0.4,
//       'Drawing': 0.7
//     };

//     for (const pred of predictions) {
//       const threshold = reasonsMap[pred.className];
//       if (threshold && pred.probability > threshold) {
//         reasons.push(`Image flagged for ${pred.className} (${(pred.probability * 100).toFixed(1)}%)`);
//       }
//     }
//   }

//   if (reasons.length > 0) {
//     await FlaggedContent.create({
//       post: post._id,
//       reason: reasons.join(', '),
//     });

//     await notifyAdmins(
//       `Post ${post._id} flagged. Reason(s): ${reasons.join(', ')}`,
//       post.user
//     );
//   }
// };

export const moderateCommentContent = async (comment, postId) => {
  const reasons = [];

  const allBadWords = [
    ...sensitiveWords.vulgar,
    ...sensitiveWords.privacy,
    ...sensitiveWords.racist,
    ...sensitiveWords.sexist,
    ...sensitiveWords.suicide,
  ];

  const text = comment.text.toLowerCase();
  const detectedWords = allBadWords.filter(word => text.includes(word.toLowerCase()));
  if (detectedWords.length > 0) {
    reasons.push(`Comment contains inappropriate text: ${detectedWords.join(', ')}`);
  }

  if (reasons.length > 0) {
    await FlaggedContent.create({
      comment: comment,
      post: postId,
      reason: reasons.join(', '),
    });

    await notifyAdmins(
      `Comment flagged on post ${postId}. Reason(s): ${reasons.join(', ')}`,
      comment.user
    );
    return true;
  }

  return false;
};
