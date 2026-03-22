import { UserMediaService } from "./userMedia.service.js";

const service = new UserMediaService();

// POST /api/user-media
// Admin assigns a media item to a user. Body: { userId, mediaId, mediaType }
export const assignMedia = async (req, res, next) => {
  try {
    const { userId, mediaId, mediaType } = req.body;
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
