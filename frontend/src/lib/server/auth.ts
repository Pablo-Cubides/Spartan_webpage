
import { verifyIdToken } from './firebaseAdmin';
import { prisma } from './prisma';

export async function verifyAdmin(request: Request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth.startsWith('Bearer ')) {
    return null;
  }

  try {
    const idToken = auth.split('Bearer ')[1];
    const decoded = await verifyIdToken(idToken);
    const uid = decoded.uid;

    const user = await prisma.user.findUnique({
      where: { uid },
    });

    if (user && user.role === 'admin') {
      return user;
    }

    return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    return null;
  }
}
