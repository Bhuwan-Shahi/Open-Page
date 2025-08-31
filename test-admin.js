const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🔄 Testing admin login...');
    
    // First, login as admin
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'shahibhuwan265@gmail.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData.user.email);
    console.log('🔑 Token received');

    // Now test the admin users API
    const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('📊 Users API Status:', usersResponse.status);
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ Users data received:', usersData.totalUsers, 'users');
      console.log('👥 Admin users:', usersData.adminUsers);
      console.log('✔️ Verified users:', usersData.verifiedUsers);
    } else {
      const errorData = await usersResponse.text();
      console.error('❌ Users API failed:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminLogin();
