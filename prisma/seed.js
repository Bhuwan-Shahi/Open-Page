const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'shahibhuwan265@gmail.com' }
  });

  if (!existingAdmin) {
    // Hash the admin password
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Bhuwan Shahi',
        email: 'shahibhuwan265@gmail.com',
        phone: '+9779876543210',
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        isActive: true
      }
    });

    console.log('✅ Admin user created:', adminUser.email);
  } else if (!existingAdmin.password) {
    // Update existing admin user with password if missing
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const updatedAdmin = await prisma.user.update({
      where: { email: 'shahibhuwan265@gmail.com' },
      data: {
        password: hashedPassword,
        isVerified: true,
        isActive: true
      }
    });
    
    console.log('✅ Admin user updated with password:', updatedAdmin.email);
  } else {
    console.log('ℹ️  Admin user already exists:', existingAdmin.email);
  }

  // Check if sample books exist
  const bookCount = await prisma.book.count();
  
  if (bookCount > 0) {
    console.log(`ℹ️  ${bookCount} books already exist in database`);
    console.log('🎉 Database seeding completed!');
    return;
  }

  console.log('📚 Creating sample books...');

  // Sample books data
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      description: "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
      price: 12.99,
      category: "Classic Literature",
      isbn: "978-0-7432-7356-5",
      pages: 180,
      language: "English",
      pdfUrl: "/sample-books/great-gatsby.pdf"
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      description: "A gripping tale of racial injustice and childhood innocence in the American South.",
      price: 14.99,
      category: "Classic Literature",
      isbn: "978-0-06-112008-4",
      pages: 324,
      language: "English",
      pdfUrl: "/sample-books/to-kill-mockingbird.pdf"
    },
    {
      title: "1984",
      author: "George Orwell",
      description: "A dystopian social science fiction novel about totalitarian control and surveillance.",
      price: 13.99,
      category: "Science Fiction",
      isbn: "978-0-452-28423-4",
      pages: 328,
      language: "English",
      pdfUrl: "/sample-books/1984.pdf"
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      description: "A controversial novel about teenage rebellion and alienation in post-war America.",
      price: 11.99,
      category: "Classic Literature",
      isbn: "978-0-316-76948-0",
      pages: 277,
      language: "English",
      pdfUrl: "/sample-books/catcher-in-rye.pdf"
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      description: "An epic science fiction novel set on the desert planet Arrakis.",
      price: 16.99,
      category: "Science Fiction",
      isbn: "978-0-441-17271-9",
      pages: 688,
      language: "English",
      pdfUrl: "/sample-books/dune.pdf"
    }
  ]

  console.log('🌱 Seeding database...')

  for (const book of books) {
    try {
      const createdBook = await prisma.book.create({
        data: book
      })
      console.log(`✅ Created book: ${createdBook.title}`)
    } catch (error) {
      console.log(`❌ Error creating book ${book.title}:`, error.message)
    }
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
