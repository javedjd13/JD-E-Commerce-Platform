const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../../config/env');
const AppError = require('../../utils/AppError');
const authRepository = require('./auth.repository');

function publicUser(user) {
  const name = [user.first_name || user.firstName, user.last_name || user.lastName].filter(Boolean).join(' ');
  return {
    id: user.publicId,
    email: user.email,
    name,
    firstName: user.first_name || user.firstName,
    lastName: user.last_name || user.lastName,
    role: user.role,
    phone: null,
    profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.email)}&background=0f172a&color=ffffff&size=160`,
    contactInformation: {
      fullName: name,
      email: user.email,
      phone: null
    },
    addresses: []
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
  const passwordHash = user?.password_hash;
  const canComparePassword = typeof passwordHash === 'string' && passwordHash.startsWith('$2');
  const passwordMatches = canComparePassword ? await bcrypt.compare(password, passwordHash).catch(() => false) : false;

  if (!user || !passwordMatches) {
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
