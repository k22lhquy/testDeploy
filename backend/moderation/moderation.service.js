// import axios from 'axios';
// import * as nsfwjs from 'nsfwjs';
// import { createCanvas, loadImage } from 'canvas';

// import { FlaggedContent } from './FlaggedContent.js';
// import { Notification } from '../models/notification.model.js';
// import { User } from '../models/user.model.js';
// import { getReceiverSocketId, io } from '../lib/socket.js';
// import sensitiveWords from './sensitiveWords.js';

// let nsfwModel;
// (async () => {
//   nsfwModel = await nsfwjs.load();
//   console.log("Mô hình NSFWJS đã được tải!");
// })();

// const checkImageForInappropriateContent = async (imageUrl) => {
//   try {
//     if (!nsfwModel) {
//       console.warn("NSFW model chưa sẵn sàng!");
//       return false;
//     }

//     const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
//     const imageBuffer = Buffer.from(response.data, 'binary');

//     const img = await loadImage(imageBuffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     const predictions = await nsfwModel.classify(canvas);
//     console.log('Predictions:', predictions);

//     const porn = predictions.find(p => p.className === 'Porn')?.probability || 0;
//     const sexy = predictions.find(p => p.className === 'Sexy')?.probability || 0;
//     const hentai = predictions.find(p => p.className === 'Hentai')?.probability || 0;
//     const drawing = predictions.find(p => p.className === 'Drawing')?.probability || 0;

//     const isFlagged = (porn > 0.4 || sexy > 0.4 || hentai > 0.4 || drawing > 0.7);

//     return isFlagged;
//   } catch (error) {
//     console.error("Lỗi khi kiểm duyệt ảnh bằng NSFWJS:", error.message);
//     return false;
//   }
// };

// const notifyAdmins = async (message, fromUserId) => {
//   try {
//     const admins = await User.find({ role: 'admin' });

//     const notifications = admins.map(admin => ({
//       from: fromUserId,
//       to: admin._id,
//       type: 'moderation',
//       reason: message,
//     }));

//     await Notification.insertMany(notifications);

//     admins.forEach(admin => {
//       if (admin.socketId) {
//         io.to(admin.socketId).emit('newNotification', {
//           message,
//           fromUserId,
//         });
//       }
//     });
//   } catch (err) {
//     console.error("Lỗi khi gửi thông báo đến admin:", err);
//   }
// };

// const moderatePostContent = async (post) => {
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
//     const imageBuffer = Buffer.from(response.data, 'binary');
//     const img = await loadImage(imageBuffer);
//     const canvas = createCanvas(img.width, img.height);
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0, img.width, img.height);

//     const predictions = await nsfwModel.classify(canvas);
//     console.log('Predictions:', predictions);

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

// const moderateCommentContent = async (comment, postId) => {
//   const reasons = [];

//   const allBadWords = [
//     ...sensitiveWords.vulgar,
//     ...sensitiveWords.privacy,
//     ...sensitiveWords.racist,
//     ...sensitiveWords.sexist,
//     ...sensitiveWords.suicide,
//   ];

//   const text = comment.text.toLowerCase();
//   const detectedWords = allBadWords.filter(word => text.includes(word.toLowerCase()));
//   if (detectedWords.length > 0) {
//     reasons.push(`Comment contains inappropriate text: ${detectedWords.join(', ')}`);
//   }

//   if (reasons.length > 0) {
//     await FlaggedContent.create({
//       comment: comment,
//       post: postId,
//       reason: reasons.join(', '),
//     });

//     await notifyAdmins(
//       `Comment flagged on post ${postId}. Reason(s): ${reasons.join(', ')}`,
//       comment.user
//     );
//     return true;
//   }

//   return false;
// };

// export {
//   moderatePostContent,
//   checkImageForInappropriateContent,
//   notifyAdmins,
//   moderateCommentContent
// };
