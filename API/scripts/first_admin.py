import passlib.hash as _hash

password = 'password123'
hashedPassword = _hash.bcrypt.hash(password)
print(hashedPassword)