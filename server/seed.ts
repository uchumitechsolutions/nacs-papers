import { db } from "./db";
import { pastPapers, admin, users, sales } from "@shared/schema";
import * as bcrypt from "bcrypt";

const samplePastPapers = [
  {
    title: "Grade 1 English Term 1 2023",
    description: "Comprehensive English examination covering reading, writing, and comprehension skills for Grade 1 learners in the first term.",
    grade: "Grade 1",
    subject: "English",
    price: 50,
    fileUrl: "/uploads/grade1-english-term1-2023.pdf",
    fileName: "grade1-english-term1-2023.pdf"
  },
  {
    title: "Grade 1 Mathematics Term 1 2023", 
    description: "Mathematics assessment focusing on numbers, basic operations, and problem-solving for Grade 1 students.",
    grade: "Grade 1",
    subject: "Mathematics",
    price: 50,
    fileUrl: "/uploads/grade1-math-term1-2023.pdf",
    fileName: "grade1-math-term1-2023.pdf"
  },
  {
    title: "Grade 2 English Term 2 2023",
    description: "English language skills assessment including grammar, vocabulary, and creative writing for Grade 2 learners.",
    grade: "Grade 2", 
    subject: "English",
    price: 60,
    fileUrl: "/uploads/grade2-english-term2-2023.pdf",
    fileName: "grade2-english-term2-2023.pdf"
  },
  {
    title: "Grade 2 Mathematics Term 2 2023",
    description: "Mathematical concepts and problem-solving examination covering addition, subtraction, and basic geometry.",
    grade: "Grade 2",
    subject: "Mathematics", 
    price: 60,
    fileUrl: "/uploads/grade2-math-term2-2023.pdf",
    fileName: "grade2-math-term2-2023.pdf"
  },
  {
    title: "Grade 3 Science Term 1 2023",
    description: "Science exploration and discovery examination covering living and non-living things, weather, and basic experiments.",
    grade: "Grade 3",
    subject: "Science",
    price: 70,
    fileUrl: "/uploads/grade3-science-term1-2023.pdf", 
    fileName: "grade3-science-term1-2023.pdf"
  },
  {
    title: "Grade 3 Social Studies Term 1 2023",
    description: "Social studies examination focusing on community, family structures, and basic geography concepts.",
    grade: "Grade 3",
    subject: "Social Studies",
    price: 70,
    fileUrl: "/uploads/grade3-social-term1-2023.pdf",
    fileName: "grade3-social-term1-2023.pdf"
  },
  {
    title: "Grade 4 English Term 3 2023",
    description: "Advanced English language examination including comprehension, essay writing, and grammar for Grade 4 students.",
    grade: "Grade 4",
    subject: "English",
    price: 80,
    fileUrl: "/uploads/grade4-english-term3-2023.pdf",
    fileName: "grade4-english-term3-2023.pdf"
  },
  {
    title: "Grade 4 Mathematics Term 3 2023",
    description: "Mathematics examination covering fractions, multiplication, division, and word problems for Grade 4 learners.",
    grade: "Grade 4",
    subject: "Mathematics",
    price: 80,
    fileUrl: "/uploads/grade4-math-term3-2023.pdf",
    fileName: "grade4-math-term3-2023.pdf"
  },
  {
    title: "Grade 5 Science Term 2 2023", 
    description: "Science examination exploring plants, animals, matter, and simple machines for Grade 5 students.",
    grade: "Grade 5",
    subject: "Science",
    price: 90,
    fileUrl: "/uploads/grade5-science-term2-2023.pdf",
    fileName: "grade5-science-term2-2023.pdf"
  },
  {
    title: "Grade 5 Kiswahili Term 2 2023",
    description: "Kiswahili language examination covering reading, writing, and oral skills for Grade 5 learners.",
    grade: "Grade 5", 
    subject: "Kiswahili",
    price: 90,
    fileUrl: "/uploads/grade5-kiswahili-term2-2023.pdf",
    fileName: "grade5-kiswahili-term2-2023.pdf"
  },
  {
    title: "Grade 6 English Term 1 2024",
    description: "Comprehensive English examination including literature, creative writing, and language skills for Grade 6 students.",
    grade: "Grade 6",
    subject: "English", 
    price: 100,
    fileUrl: "/uploads/grade6-english-term1-2024.pdf",
    fileName: "grade6-english-term1-2024.pdf"
  },
  {
    title: "Grade 6 Mathematics Term 1 2024",
    description: "Advanced mathematics examination covering decimals, percentages, geometry, and data handling.",
    grade: "Grade 6",
    subject: "Mathematics",
    price: 100,
    fileUrl: "/uploads/grade6-math-term1-2024.pdf",
    fileName: "grade6-math-term1-2024.pdf"
  },
  {
    title: "Grade 6 Science Term 1 2024",
    description: "Science examination exploring energy, forces, human body systems, and environmental conservation.",
    grade: "Grade 6", 
    subject: "Science",
    price: 100,
    fileUrl: "/uploads/grade6-science-term1-2024.pdf",
    fileName: "grade6-science-term1-2024.pdf"
  },
  {
    title: "Grade 6 Social Studies Term 1 2024",
    description: "Social studies examination covering Kenyan history, geography, government, and civic education.",
    grade: "Grade 6",
    subject: "Social Studies",
    price: 100,
    fileUrl: "/uploads/grade6-social-term1-2024.pdf",
    fileName: "grade6-social-term1-2024.pdf"
  },
  {
    title: "Grade 4 Creative Arts Term 2 2023",
    description: "Creative arts examination covering music, art, and crafts activities for Grade 4 learners.",
    grade: "Grade 4",
    subject: "Creative Arts",
    price: 75,
    fileUrl: "/uploads/grade4-arts-term2-2023.pdf",
    fileName: "grade4-arts-term2-2023.pdf"
  }
];

export async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data (optional - remove if you want to keep existing data)
    console.log("🗑️ Clearing existing data...");
    await db.delete(pastPapers);
    await db.delete(admin);
    await db.delete(users);
    await db.delete(sales);

    // Seed past papers
    console.log("📚 Seeding past papers...");
    await db.insert(pastPapers).values(samplePastPapers);
    console.log(`✅ Added ${samplePastPapers.length} past papers`);

    // Seed admin user
    console.log("👤 Creating admin user...");
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db.insert(admin).values({
      username: "admin",
      password: hashedPassword
    });
    console.log("✅ Admin user created (username: admin, password: admin123)");

    // Seed sample users
    console.log("👥 Creating sample users...");
    const sampleUsers = [
      {
        username: "john_doe",
        email: "john@example.com", 
        password: await bcrypt.hash("password123", 10),
        firstName: "John",
        lastName: "Doe"
      },
      {
        username: "mary_wanjiku",
        email: "mary@example.com",
        password: await bcrypt.hash("password123", 10), 
        firstName: "Mary",
        lastName: "Wanjiku"
      }
    ];
    
    await db.insert(users).values(sampleUsers);
    console.log(`✅ Added ${sampleUsers.length} sample users`);

    // Seed sample sales
    console.log("💰 Creating sample sales...");
    const sampleSales = [
      {
        customerEmail: "customer1@example.com",
        paperIds: [1, 2, 3],
        totalAmount: 160,
        paymentMethod: "M-Pesa",
        status: "completed"
      },
      {
        customerEmail: "customer2@example.com", 
        paperIds: [4, 5],
        totalAmount: 130,
        paymentMethod: "Visa",
        status: "completed"
      },
      {
        customerEmail: "customer3@example.com",
        paperIds: [6],
        totalAmount: 70,
        paymentMethod: "M-Pesa", 
        status: "completed"
      }
    ];

    await db.insert(sales).values(sampleSales);
    console.log(`✅ Added ${sampleSales.length} sample sales`);

    console.log("🎉 Database seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => {
      console.log("✅ Seeding complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}