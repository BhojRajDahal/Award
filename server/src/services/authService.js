import bcrypt from 'bcrypt';
import { createUser, findByEmail } from '../model/userModel.js';

export const registerService = async (full_name, email, password) => {
    const existingUsers = await findByEmail(email);

    if (existingUsers.length > 0) {
        throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    await createUser(full_name, email, hashed);

    return 'User registered successfully';
};

export const loginService = async (email, password) => {
    const users = await findByEmail(email);

    if (users.length === 0) {
        throw new Error('Invalid email or password');
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    // Return user data without password
    // Database uses 'uid' as primary key for users table
    const userId = user.uid || user.user_id || user.id;
    return {
        id: userId,
        user_id: userId,
        uid: userId, // Include uid for database compatibility
        full_name: user.full_name,
        email: user.email,
    };
};