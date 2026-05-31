const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const authRepository = require('./auth.repository');

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: [user.first_name || user.firstName, user.last_name || user.lastName].filter(Boolean).join(' '),
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    role: user.role
  };
}

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role
    },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

async function signup(input) {
  const existing = await authRepository.findUserByEmail(input.email);
  if (existing) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  const nameParts = input.name?.trim().split(/\s+/) || [];
  const firstName = input.firstName || nameParts[0];
  const lastName = input.lastName || nameParts.slice(1).join(' ') || 'User';
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await authRepository.createUser({
    email: input.email,
    passwordHash,
    firstName,
    lastName
  });

  return {
    token: signAccessToken(user),
    user: publicUser(user)
  };
}

async function login({ email, password }) {
  const user = await authRepository.findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  return {
    token: signAccessToken(user),
    user: publicUser(user)
  };
}

async function logout() {
  return null;
}

module.exports = { signup, login, logout };

export {};
