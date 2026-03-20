import bcrypt from "bcryptjs";
import { UserRepository } from "./user.repository.js";

const looksBcryptHash = (s) =>
  typeof s === "string" && s.startsWith("$2") && s.length >= 59;

export class UserService {
  constructor(repo = new UserRepository()) {
    this.repo = repo;
  }

  async create(email, username, passwordHash, role = "user") {
    const exists = await this.repo.findByEmail(email);
    if (exists) {
      const e = new Error("Email already exists");
      e.status = 409;
      throw e;
    }
    return this.repo.create({ email, username, password: passwordHash, role });
  }

  get(id) {
    return this.repo.findById(id);
  }

  list(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    return this.repo.findMany(skip, pageSize);
  }

  async update(id, data) {
    const patch = { ...data };

    if (patch.email) {
      const existing = await this.repo.findByEmail(patch.email);
      if (existing && existing.id !== id) {
        const e = new Error("Email already in use");
        e.status = 409;
        throw e;
      }
    }

    if (typeof patch.password === "string" && patch.password.trim().length > 0) {
      if (!looksBcryptHash(patch.password)) {
        patch.password = await bcrypt.hash(patch.password, 12);
      }
    } else {
      delete patch.password;
    }

    return this.repo.update(id, patch);
  }

  remove(id) {
    return this.repo.delete(id);
  }
}
