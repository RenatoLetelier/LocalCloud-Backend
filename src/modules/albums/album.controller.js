import { AlbumService } from "./album.service.js";

const service = new AlbumService();

// GET /api/albums
export const listAlbums = async (req, res, next) => {
  try {
    const albums = await service.listByUser(req.user.id);
    res.json(albums);
  } catch (err) {
    next(err);
  }
};

// POST /api/albums
export const createAlbum = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const album = await service.create(req.user.id, name, description);
    res.status(201).json(album);
  } catch (err) {
    next(err);
  }
};

// GET /api/albums/:id
export const getAlbum = async (req, res, next) => {
  try {
    const album = await service.get(req.params.id, req.user.id, req.user.role);
    res.json(album);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/albums/:id
export const updateAlbum = async (req, res, next) => {
  try {
    const album = await service.update(req.params.id, req.body, req.user.id, req.user.role);
    res.json(album);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/albums/:id
export const deleteAlbum = async (req, res, next) => {
  try {
    await service.remove(req.params.id, req.user.id, req.user.role);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

// POST /api/albums/:id/items
export const addAlbumItem = async (req, res, next) => {
  try {
    const item = await service.addItem(
      req.params.id,
      req.body.userMediaId,
      req.user.id,
      req.user.role
    );
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/albums/:id/items/:userMediaId
export const removeAlbumItem = async (req, res, next) => {
  try {
    await service.removeItem(
      req.params.id,
      req.params.userMediaId,
      req.user.id,
      req.user.role
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
