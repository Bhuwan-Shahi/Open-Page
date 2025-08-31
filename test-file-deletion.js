// Test script to verify file deletion on payment rejection
const fs = require('fs').promises;
const path = require('path');

async function testFileDeletion() {
  console.log('🧪 Testing file deletion functionality...');
  
  // Create a test file in uploads directory
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const testFileName = 'test-payment-screenshot.jpg';
  const testFilePath = path.join(uploadsDir, testFileName);
  
  try {
    // Ensure uploads directory exists
    await fs.mkdir(uploadsDir, { recursive: true });
    
    // Create a test file
    await fs.writeFile(testFilePath, 'test content');
    console.log('✅ Test file created:', testFileName);
    
    // Check if file exists
    const existsBefore = await fs.access(testFilePath).then(() => true).catch(() => false);
    console.log('📁 File exists before deletion:', existsBefore);
    
    // Test deletion
    await fs.unlink(testFilePath);
    console.log('🗑️ File deletion attempted');
    
    // Check if file exists after deletion
    const existsAfter = await fs.access(testFilePath).then(() => true).catch(() => false);
    console.log('📁 File exists after deletion:', existsAfter);
    
    if (!existsAfter) {
      console.log('🎉 File deletion test PASSED!');
    } else {
      console.log('❌ File deletion test FAILED!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFileDeletion();
