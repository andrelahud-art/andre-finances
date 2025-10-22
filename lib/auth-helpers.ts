import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get or create user in database
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser) {
    // Create user if doesn't exist
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split('@')[0],
        password: '', // Password managed by Supabase
      },
    });
  }

  return dbUser;
}
