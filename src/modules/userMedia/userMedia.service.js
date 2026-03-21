import { UserMediaRepository } from "./userMedia.repository.js";

export class UserMediaService {
  constructor(repo = new UserMediaRepository()) {
    this.repo = repo;
  }

  async assign(userId, mediaId, mediaType) {
    const existing = await this.repo.findByUserAndMediaId(userId, mediaId);
    if (existing) {
      const e = new Error("Media already assigned to this user");
      e.status = 409;
      throw e;
    }
    return this.repo.create(userId, mediaId, mediaType);
  }

  listByUser(userId) {
    return this.repo.findByUser(userId);
  }

  getMediaIdsByType(userId, mediaType) {
    return this.repo.findByUserAndType(userId, mediaType).then((items) =>
      items.map((i) => i.mediaId)
    );
  }

  async remove(id, requesterId, requesterRole) {
    const record = await this.repo.findById(id);
    if (!record) {
      const e = new Error("User media not found");
      e.status = 404;
      throw e;
    }
    if (requesterRole !== "admin" && record.userId !== requesterId) {
      const e = new Error("Forbidden");
      e.status = 403;
      throw e;
    }
    return this.repo.delete(id);
  }
}
