// Shared utility functions for APIs
import { prisma } from '@/lib/prisma';

// FIXED USER ID - Same for all devices and computers
const FIXED_USER_ID = 'andre-lahud-main-user-2025';

export async function getOrCreateUser() {
  let user = await prisma.user.findUnique({
    where: { id: FIXED_USER_ID }
  });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: FIXED_USER_ID,
        email: 'andre@finances.com',
        name: 'André Lahud',
        password: 'no-password', // Required field
      },
    });
  }
  return user;
}