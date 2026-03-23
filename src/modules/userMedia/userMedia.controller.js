import { UserMediaService } from "./userMedia.service.js";

const service = new UserMediaService();

// POST /api/user-media
// Any authenticated user can link a media item to themselves.
// Admins can also link to any userId supplied in the body.
// Body: { userId, mediaId, mediaType }
export const assignMedia = async (req, res, next) => {
  try {
    const { mediaId, mediaType } = req.body;
    // Non-admins can only assign to themselves regardless of what userId they send
    const userId = req.user.role === "admin" && req.body.userId
      ? req.body.userId
      : req.user.id;
    const record = await service.assign(userId, mediaId, mediaType);
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// GET /api/user-media
// Returns the authenticated user's media assignments.
export const listMyMedia = async (req, res, next) => {
  try {
    const items = await service.listByUser(req.user.id);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/user-media/user/:userId   (admin only)
// Returns a specific user's media assignments.
export const listUserMedia = async (req, res, next) => {
  try {
    const items = await service.listByUser(req.params.userId);
    res.json(items);
  } catch (err) {
    next(err);
  }
};

// POST /api/user-media/claim
// Lets an authenticated user claim a list of mediaIds by ID (e.g. to recover
// photos that were uploaded before auto-linking was in place).
// Body: { mediaIds: ["id1", "id2", …], mediaType: "photo" | "video" }
export const claimMedia = async (req, res, next) => {
  try {
    const { mediaIds = [], mediaType = "photo" } = req.body;
    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res.status(400).json({ message: "mediaIds must be a non-empty array" });
    }
    const records = await Promise.all(
      mediaIds.map((mediaId) =>
        service.assign(req.user.id, String(mediaId), mediaType)
      )
    );
    res.status(201).json({ claimed: records.length, records });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/user-media/:id
// Admin or owner removes a media assignment.
export const removeMedia = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user.id, req.user.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
