import bcrypt from "bcryptjs";
import { UserService } from "./user.service.js";

const service = new UserService();

export const createUser = async (req, res, next) => {
  try {
    const { email, username, password, role = "user" } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await service.create(email, username, passwordHash, role);

    res.status(201).json({ user });
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
    const page = Math.max(1, Number(req.query.page ?? 1));
    const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
    const { data, total } = await service.list(page, pageSize);
    const totalPages = Math.ceil(total / pageSize);
    res.json({ total, page, pageSize, totalPages, data });
  } catch (err) {
    next(err);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await service.update(req.params.id, req.body);
    res.json(user);
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
