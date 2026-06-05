const db = require('../../database/db');
import prisma from '../../lib/prisma';

function normalizePrismaUser(user) {
  if (!user) return null;
  const [firstName = '', ...lastNameParts] = String(user.name || '').split(/\s+/).filter(Boolean);

  return {
    id: user.id,
    publicId: user.publicId,
    email: user.email,
    password_hash: user.password,
    first_name: firstName || user.name || 'User',
    last_name: lastNameParts.join(' ') || 'User',
    role: user.role
  };
}

async function syncLegacyUserToPrisma(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email.split('@')[0];

  const prismaUser = await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name,
      password: user.password_hash,
      role: String(user.role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER'
    },
    create: {
      id: user.id,
      name,
      email: user.email,
      password: user.password_hash,
      role: String(user.role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER'
    }
  });

  return normalizePrismaUser(prismaUser);
}

async function findUserByEmail(email) {
  const prismaUser = await prisma.user.findUnique({ where: { email } });
  if (prismaUser) return normalizePrismaUser(prismaUser);

  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ? syncLegacyUserToPrisma(rows[0]) : null;
}

async function createUser({ email, passwordHash, firstName, lastName }) {
  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      name: [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0]
    }
  });

  return normalizePrismaUser(user);
}

async function saveRefreshToken({ userId, tokenHash, expiresAt }) {
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function revokeRefreshToken(tokenHash) {
  await db.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1', [tokenHash]);
}

module.exports = { findUserByEmail, createUser, saveRefreshToken, revokeRefreshToken };

export {};
