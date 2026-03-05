import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyIdToken } from "@/lib/server/firebaseAdmin";

// POST: Create session cookie
export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        // Verify the token
        const decodedToken = await verifyIdToken(idToken);

        // Expiration: 12 hours (reduce stolen-token blast radius)
        const expiresIn = 60 * 60 * 12 * 1000;

        // Set cookie
        const cookieStore = await cookies();
        cookieStore.set("__session", idToken, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "strict",
        });

        return NextResponse.json({ status: "success", uid: decodedToken.uid });
    } catch (error) {
        console.error("Session creation error:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// DELETE: Clear session cookie
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("__session");
    return NextResponse.json({ status: "success" });
}
