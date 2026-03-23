import { UserMediaRepository } from "./userMedia.repository.js";

export class UserMediaService {
  constructor(repo = new UserMediaRepository()) {
    this.repo = repo;
  }

  async assign(userId, mediaId, mediaType) {
    // upsert: safe to call multiple times — no 409 if already linked
    return this.repo.upsert(userId, mediaId, mediaType);
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
