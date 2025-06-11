import Notification from '../models/notification.model.js';
import sensitiveWords from './sensitiveWords.js';

import { detectImage } from '../lib/detectImage.js';

export const notifyAdmins = async (message, fromUserId, post) => {
  try {
    await Notification.create({
      from: fromUserId,
      to: null,
      post: post,
      type: "moderation",
      reason: message,
    });
  } catch (err) {
    console.error("❌ Gửi thông báo lỗi:", err);
  }
};


export const moderatePostContent = async (post) => {
  const reasons = [];

  const allBadWords = [
    ...sensitiveWords.vulgar,
    ...sensitiveWords.privacy,
    ...sensitiveWords.racist,
    ...sensitiveWords.sexist,
    ...sensitiveWords.suicide,
  ];

  if (post.text) {
    const text = post.text.toLowerCase();
    const detectedWords = allBadWords.filter(word => text.includes(word.toLowerCase()));
    if (detectedWords.length > 0) {
      reasons.push(`Inappropriate text: ${detectedWords.join(', ')}`);
    }
  }

  if (post.image) {
    try {
      const result = await detectImage(post.image);

      if (result.data.is_approved === false) {
        reasons.push(`Image flagged for ${result.data.reason} (confidence: ${(result.data.confidence * 100).toFixed(1)}%)`);
        console.log(`Image flagged for ${result.data.reason} (confidence: ${(result.data.confidence * 100).toFixed(1)}%)`)
      }
    } catch (err) {
      console.error('Error detecting image:', err);
      reasons.push('Image detection failed');
    }
  }

  // Nếu có lý do bị flag thì lưu và notify
  if (reasons.length > 0) {
    await notifyAdmins(
      `Post ${post._id} flagged. Reason(s): ${reasons.join(', ')}`,
      post.user,
      post
    );
  }
};



// export const moderateCommentContent = async (comment, postId) => {
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
//     await notifyAdmins(
//       `Comment flagged on post ${postId}. Reason(s): ${reasons.join(', ')}`,
//       comment.user,

//     );
//     return true;
//   }

//   return false;
// };
