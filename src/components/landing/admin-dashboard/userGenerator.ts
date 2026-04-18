import { UserData } from './types'

export const generateRealisticUsers = (): UserData[] => {
  const names = [
    "Aamit Mirkar",
    "Tejas Malve",
    "Dikshant Kasabe",
    "Priya Sharma",
    "Rohit Patil",
    "Sneha Desai",
    "Arjun Kulkarni",
    "Kavya Joshi",
    "Vikram Singh",
    "Anita Rao",
    "Siddharth Mehta",
    "Pooja Gupta",
    "Rahul Nair",
    "Deepika Iyer",
    "Karan Agarwal",
    "Meera Reddy",
    "Ajay Kumar",
    "Ritu Bansal",
    "Nikhil Jain",
    "Swati Pandey",
  ]

  const phoneNumbers = [
    "+91 9967954630",
    "+91 8765432109",
    "+91 9876543210",
    "+91 7654321098",
    "+91 8901234567",
    "+91 9012345678",
    "+91 7890123456",
    "+91 8123456789",
    "+91 9234567890",
    "+91 7345678901",
    "+91 8456789012",
    "+91 9567890123",
    "+91 7678901234",
    "+91 8789012345",
    "+91 9890123456",
    "+91 7901234567",
    "+91 8012345678",
    "+91 9123456789",
    "+91 7234567890",
    "+91 8345678901",
  ]

  return names.map((name, index) => {
    const regDate = new Date(2025, 8, Math.floor(Math.random() * 7) + 1) // Sept 1-7, 2025
    const lastActiveDate = new Date(2025, 8, Math.floor(Math.random() * 7) + 1) // Recent activity

    // Generate realistic attendance pattern (7 days)
    const attendance: ("present" | "absent" | "upcoming")[] = Array.from({ length: 7 }, (_, dayIndex) => {
      const dayDate = new Date(2025, 8, dayIndex + 1)
      const today = new Date(2025, 8, 8) // Assuming today is Sept 8, 2025

      if (dayDate > today) return "upcoming"

      // Realistic attendance patterns - some users more consistent than others
      const userConsistency = Math.random()
      if (userConsistency > 0.8) return "present" // Very consistent users
      if (userConsistency > 0.6) return Math.random() > 0.2 ? "present" : "absent" // Mostly present
      if (userConsistency > 0.3) return Math.random() > 0.5 ? "present" : "absent" // Mixed attendance
      return Math.random() > 0.7 ? "present" : "absent" // Irregular users
    })

    return {
      id: index + 1,
      name: name,
      email: `user${index + 1}@example.com`,
      status: "active",
      userId: `USR${String(index + 1).padStart(4, "0")}`,
      username: name,
      whatsapp: phoneNumbers[index],
      regDate: regDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      lastDate: lastActiveDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
      attendance: attendance,
      joinedDaysAgo: Math.floor((new Date().getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24)),
    }
  })
}