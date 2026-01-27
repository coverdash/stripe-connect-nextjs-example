import { exchangeCodeForToken } from "@/lib/oauth";
import { storeOAuthToken } from "@/lib/storage";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const token = await exchangeCodeForToken(code);
    storeOAuthToken(token);

    return res.json(token);
  } catch (error) {
    console.error("OAuth token exchange error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to exchange token",
    });
  }
}
