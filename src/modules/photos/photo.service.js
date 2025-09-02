import { PhotoRepository } from "./photo.repository.js";

export class PhotoService {
  constructor(repo = new PhotoRepository()) {
    this.repo = repo;
  }

  async create({
    name,
    description,
    path,
    albums,
    tags,
    visibility,
    metadata,
    uploadedBy,
  }) {
    const exists = await this.repo.findByPath(path);
    if (exists) {
      const e = new Error("Path of photo already exists");
      e.status = 409;
      throw e;
    }
    return this.repo.create({
      name,
      description,
      path,
      albums,
      tags,
      visibility,
      metadata,
      uploadedBy,
    });
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

    if (patch.path) {
      const existing = await this.repo.findByPath(patch.path);
      if (existing && existing.id !== id) {
        const e = new Error("Path already in use");
        e.status = 409;
        throw e;
      }
    }

    return this.repo.update(id, patch);
  }

  remove(id) {
    return this.repo.delete(id);
  }
}
