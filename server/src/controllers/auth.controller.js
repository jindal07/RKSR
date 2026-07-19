import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma.js';
import { ApiError, asyncHandler } from '../middleware/errorHandler.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
} from '../utils/tokens.js';

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, phone: u.phone });

function sendTokens(res, user) {
  res.cookie('refreshToken', signRefreshToken(user), refreshCookieOptions);
  return { accessToken: signAccessToken(user), user: publicUser(user) };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'An account with this email already exists');
  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });
  res.status(201).json(sendTokens(res, user));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  res.json(sendTokens(res, user));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Not authenticated');
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Session expired');
  }
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) throw new ApiError(401, 'Account no longer exists');
  res.json(sendTokens(res, user));
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('refreshToken', { ...refreshCookieOptions, maxAge: 0 });
  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ user: publicUser(user) });
});
