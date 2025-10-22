// Shared utility functions for APIs
import { prisma } from '@/lib/prisma';

export async function getOrCreateUser() {
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        name: 'André',
        password: 'demo123', // Required field
      },
    });
  }
  return user;
}