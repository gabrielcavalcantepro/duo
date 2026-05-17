/**
 * Returns the avatar_url for a partner based on their name.
 */
export function getPartnerAvatar(couple, name) {
  if (!couple || !name) return null;
  if (name === couple.partner1Name) return couple.partner1AvatarUrl || null;
  if (name === couple.partner2Name) return couple.partner2AvatarUrl || null;
  return null;
}

/**
 * Returns full data (name, color, avatarUrl) for partner 1 or 2.
 */
export function getPartnerData(couple, partnerNumber) {
  if (!couple) return { name: '', color: '#D4537E', avatarUrl: null };
  return {
    name: partnerNumber === 1 ? couple.partner1Name : couple.partner2Name,
    color: partnerNumber === 1 ? couple.partner1Color : couple.partner2Color,
    avatarUrl: partnerNumber === 1 ? couple.partner1AvatarUrl : couple.partner2AvatarUrl,
  };
}
