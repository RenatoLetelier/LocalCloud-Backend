import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "./user.service.js";
import { env } from "../../config/env.js";

const service = new UserService();

export const createUser = async (req, res, next) => {
  try {
    const { email, username, password, role = "user" } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await service.create(email, username, passwordHash, role);

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      env.jwtSecret || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _omit, ...safeUser } = user;

    res.status(201).json({ user: safeUser, token });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await service.get(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await service.list(page, pageSize);
    res.json({ page, pageSize, data });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    // Nunca retornes el hash
    const { password: _omit, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
