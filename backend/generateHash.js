const bcrypt = require('bcryptjs');

bcrypt.hash('admin123', 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
