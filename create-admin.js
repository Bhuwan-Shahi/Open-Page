const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔄 Creating admin user...');
    
    // Your admin email
    const adminEmail = 'shahibhuwan265@gmail.com';
    const adminPassword = 'admin123'; // You can change this password
    
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      // Update existing user to admin
      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: 'ADMIN',
          isVerified: true
        }
      });
      console.log('✅ Updated existing user to admin:', updatedAdmin.email);
      return;
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Bhuwan Shahi',
        email: adminEmail,
        phone: '+977-9876543210', // Add your phone if you want
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Role:', adminUser.role);
    console.log('📱 Phone:', adminUser.phone);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
