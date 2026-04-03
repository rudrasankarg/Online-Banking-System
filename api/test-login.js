fetch('http://localhost:5000/api/auth/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'fake@gmail.com', password: '123' })
}).then(async r => {
  console.log(r.status, await r.json());
}).catch(console.error);
