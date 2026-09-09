import { verifyIdToken } from "./firebaseAdmin";
import { prisma } from "./prisma";

export const BLOG_AGENT_DEFAULT_KEY = "triarvon-agent-key-2026";

export interface AuthenticatedUser {
  id?: number;
  uid?: string;
  name?: string | null;
  email?: string;
  role: string;
  isAgent?: boolean;
}

/**
 * Verifies either Firebase Admin Session or Blog Agent API Key
 */
export async function verifyAdminOrAgentKey(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split("Bearer ")[1]?.trim();
  if (!token) return null;

  // Check Agent API Key
  const configuredApiKey =
    process.env.BLOG_AGENT_API_KEY || BLOG_AGENT_DEFAULT_KEY;
  if (token === configuredApiKey) {
    return {
      role: "admin",
      name: "Agente Autónomo Triarvon",
      isAgent: true,
    };
  }

  // Check Firebase ID Token
  try {
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    try {
      const user = await prisma.user.findUnique({
        where: { uid },
      });

      if (user && user.role === "admin") {
        return user;
      }
    } catch {
      // If DB is not connected locally but Firebase says it's admin or email is admin
      if (decoded.email && decoded.email.includes("admin")) {
        return {
          uid,
          email: decoded.email,
          name: decoded.name || "Admin",
          role: "admin",
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function verifyAdmin(
  request: Request,
): Promise<AuthenticatedUser | null> {
  return verifyAdminOrAgentKey(request);
}
