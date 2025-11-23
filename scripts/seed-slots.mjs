import "dotenv/config";
import mongoose from "mongoose";
import { Doctor } from "../models/doctor.model.js";
import { Availability } from "../models/availability.model.js";

await mongoose.connect(process.env.MONGODB_URI);

const times = [
  ["15:30","16:00"],
  ["16:00","16:30"],
  ["20:30","21:00"],
  ["21:30","22:00"],
];

const doctors = await Doctor.find({}).lean();
for (const d of doctors) {
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setHours(0,0,0,0);
    day.setDate(day.getDate() + i);
    for (const [startTime, endTime] of times) {
      await Availability.updateOne(
        { doctor: d._id, date: day, startTime },
        {
          $setOnInsert: {
            doctor: d._id,
            date: day,
            startTime,
            endTime,
            isBooked: false
          }
        },
        { upsert: true }
      );
    }
  }
}

console.log("✅ Seeded slots for next 7 days");
await mongoose.disconnect();
