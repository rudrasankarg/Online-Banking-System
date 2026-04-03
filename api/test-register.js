fetch('http://localhost:5000/api/auth/user/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    name: 'Test Setup',
    email: 'newuser123@gmail.com', 
    password: 'Password123!',
    phone: '9876543210',
    country: 'India',
    accountType: 'domestic'
  })
}).then(async r => {
  console.log(r.status, await r.json());
}).catch(console.error);
