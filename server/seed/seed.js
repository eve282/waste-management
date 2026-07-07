// Run with: npm run seed
// Wipes and repopulates User, Worker, Complaint, StatusLog collections with sample data.
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Worker = require("../models/Worker");
const Complaint = require("../models/Complaint");
const StatusLog = require("../models/StatusLog");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Worker.deleteMany({}),
    Complaint.deleteMany({}),
    StatusLog.deleteMany({}),
  ]);

  console.log("Creating users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@wastemgmt.local",
    phone: "9990000001",
    password: "Admin@123",
    role: "admin",
    address: "Municipal Office, Greater Noida",
  });

  const citizen1 = await User.create({
    name: "Ravi Kumar",
    email: "ravi@example.com",
    phone: "9990000002",
    password: "Citizen@123",
    role: "citizen",
    address: "Sector 62, Noida",
  });

  const citizen2 = await User.create({
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "9990000003",
    password: "Citizen@123",
    role: "citizen",
    address: "Sector 78, Noida",
  });

  const workerUser1 = await User.create({
    name: "Suresh Yadav",
    email: "suresh.worker@wastemgmt.local",
    phone: "9990000004",
    password: "Worker@123",
    role: "worker",
    address: "Greater Noida",
  });

  const workerUser2 = await User.create({
    name: "Manoj Singh",
    email: "manoj.worker@wastemgmt.local",
    phone: "9990000005",
    password: "Worker@123",
    role: "worker",
    address: "Greater Noida",
  });

  console.log("Creating worker profiles...");
  const worker1 = await Worker.create({
    userId: workerUser1._id,
    name: workerUser1.name,
    phone: workerUser1.phone,
    zoneAssigned: "Sector 62",
  });

  const worker2 = await Worker.create({
    userId: workerUser2._id,
    name: workerUser2.name,
    phone: workerUser2.phone,
    zoneAssigned: "Sector 78",
  });

  console.log("Creating sample complaints...");
  const complaintsData = [
    {
      userId: citizen1._id,
      category: "garbage_overflow",
      description: "Garbage bin near the park has been overflowing for 3 days.",
      location: { lat: 28.6139, lng: 77.209 },
      address: "Sector 62, Noida",
      status: "pending",
      priority: "medium",
    },
    {
      userId: citizen1._id,
      category: "missed_pickup",
      description: "No collection truck came to our street this week.",
      location: { lat: 28.615, lng: 77.212 },
      address: "Sector 62, Noida",
      status: "assigned",
      priority: "low",
      assignedWorkerId: worker1._id,
    },
    {
      userId: citizen2._id,
      category: "illegal_dumping",
      description: "Construction debris dumped illegally behind the market.",
      location: { lat: 28.62, lng: 77.22 },
      address: "Sector 78, Noida",
      status: "in_progress",
      priority: "high",
      assignedWorkerId: worker2._id,
    },
    {
      userId: citizen2._id,
      category: "other",
      description: "Foul smell from a blocked drain mixed with waste.",
      location: { lat: 28.625, lng: 77.225 },
      address: "Sector 78, Noida",
      status: "resolved",
      priority: "medium",
      assignedWorkerId: worker2._id,
      resolvedAt: new Date(),
    },
  ];

  const complaints = await Complaint.insertMany(complaintsData);

  console.log("Syncing worker active task counts...");
  for (const worker of [worker1, worker2]) {
    const activeCount = await Complaint.countDocuments({
      assignedWorkerId: worker._id,
      status: { $ne: "resolved" },
    });
    worker.activeTaskCount = activeCount;
    await worker.save();
  }

  console.log("Creating status logs...");
  for (const c of complaints) {
    await StatusLog.create({
      complaintId: c._id,
      newStatus: "pending",
      changedBy: c.userId,
    });
    if (c.status !== "pending") {
      await StatusLog.create({
        complaintId: c._id,
        oldStatus: "pending",
        newStatus: c.status,
        changedBy: admin._id,
      });
    }
  }

  console.log("\nSeed complete. Sample logins:");
  console.log("  Admin   -> admin@wastemgmt.local / Admin@123");
  console.log("  Citizen -> ravi@example.com / Citizen@123");
  console.log("  Citizen -> priya@example.com / Citizen@123");
  console.log("  Worker  -> suresh.worker@wastemgmt.local / Worker@123");
  console.log("  Worker  -> manoj.worker@wastemgmt.local / Worker@123");

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
