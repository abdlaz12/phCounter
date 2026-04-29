import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ success: false });

  try {
    await connectDB();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId || decoded.id);
    if (!user) return res.status(404).json({ success: false });

    return res.status(200).json({ 
      success: true, 
      data: user.toSafeObject() 
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Session expired" });
  }
}