import { getMedicalHistoryByUserId } from "../services/medicalHistory.service.js";
import logger from "../utils/logger.js";

export const getMyMedicalHistory = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const history = await getMedicalHistoryByUserId(userId);
    return res.json({ count: history.length, history });
  } catch (err) {
    logger.error("getMyMedicalHistory error:", err);
    return res.status(500).json({ message: "Failed to fetch medical history" });
  }
};

export const getPatientMedicalHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "Missing userId" });

    const history = await getMedicalHistoryByUserId(userId);
    return res.json({ count: history.length, history });
  } catch (err) {
    logger.error("getPatientMedicalHistory error:", err);
    return res.status(500).json({ message: "Failed to fetch medical history" });
  }
};
