-- Update users with correct password hash
UPDATE users SET password_hash = '$2a$10$Q06L3ebsyyD9sVvmyQkoDOQMyEf/6mJwBfa1MuSHh69Gmwow7OdYq' WHERE email = 'test1@example.com';
UPDATE users SET password_hash = '$2a$10$Q06L3ebsyyD9sVvmyQkoDOQMyEf/6mJwBfa1MuSHh69Gmwow7OdYq' WHERE email = 'test2@example.com';
UPDATE users SET password_hash = '$2a$10$Q06L3ebsyyD9sVvmyQkoDOQMyEf/6mJwBfa1MuSHh69Gmwow7OdYq' WHERE email = 'test3@example.com';
