import { AlbumRepository } from "./album.repository.js";
import { UserMediaRepository } from "../userMedia/userMedia.repository.js";

export class AlbumService {
  constructor(repo = new AlbumRepository(), userMediaRepo = new UserMediaRepository()) {
    this.repo = repo;
    this.userMediaRepo = userMediaRepo;
  }

  create(userId, name, description) {
    return this.repo.create(userId, name, description);
  }

  listByUser(userId) {
    return this.repo.findByUser(userId);
  }

  async get(id, requesterId, requesterRole) {
    const album = await this.repo.findById(id);
    if (!album) {
      const e = new Error("Album not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && album.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    return album;
  }

  async update(id, data, requesterId, requesterRole) {
    const album = await this.repo.findById(id);
    if (!album) {
      const e = new Error("Album not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && album.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    return this.repo.update(id, data);
  }

  async remove(id, requesterId, requesterRole) {
    const album = await this.repo.findById(id);
    if (!album) {
      const e = new Error("Album not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && album.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    return this.repo.delete(id);
  }

  async addItem(albumId, userMediaId, requesterId, requesterRole) {
    const album = await this.repo.findById(albumId);
    if (!album) {
      const e = new Error("Album not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && album.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    // Verify the userMedia record belongs to the album owner
    const userMedia = await this.userMediaRepo.findById(userMediaId);
    if (!userMedia) {
      const e = new Error("Media not found in your library");
      e.status = 404;
      throw e;
    }
    if (userMedia.userId !== album.userId) {
      const e = new Error("Media does not belong to this user");
      e.status = 400;
      throw e;
    }

    const existing = await this.repo.findItem(albumId, userMediaId);
    if (existing) {
      const e = new Error("Media already in album");
      e.status = 409;
      throw e;
    }

    return this.repo.addItem(albumId, userMediaId);
  }

  async removeItem(albumId, userMediaId, requesterId, requesterRole) {
    const album = await this.repo.findById(albumId);
    if (!album) {
      const e = new Error("Album not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && album.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }

    const item = await this.repo.findItem(albumId, userMediaId);
    if (!item) {
      const e = new Error("Media not in album");
      e.status = 404;
      throw e;
    }

    return this.repo.removeItem(albumId, userMediaId);
  }
}
