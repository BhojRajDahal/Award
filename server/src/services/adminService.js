import bcrypt from 'bcrypt';
import { createAdmin, findByEmail } from '../model/adminModel.js';

export const registerAdminService = async (full_name, email, password, department = null) => {
    const existingAdmins = await findByEmail(email);

    if (existingAdmins.length > 0) {
        throw new Error('Email already exists');
    }

    const hashed = await bcrypt.hash(password, 10);
    await createAdmin(full_name, email, hashed, department);

    return 'Admin registered successfully';
};

export const loginAdminService = async (email, password) => {
    const admins = await findByEmail(email);

    if (admins.length === 0) {
        throw new Error('Invalid email or password');
    }

    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
        throw new Error('Invalid email or password');
    }

    return {
        aid: admin.aid,
        full_name: admin.full_name,
        email: admin.email,
        department: admin.department,
    };
};


