import { PhotoService } from "./photo.service.js";
import { env } from "../../config/env.js";

const service = new PhotoService();

export const createPhoto = async (req, res, next) => {
  const body = req.body;
  try {
    const photo = await service.create(body);

    return res.status(201).json({ photo });
  } catch (err) {
    next(err);
  }
};

export const getPhoto = async (req, res, next) => {
  try {
    const photo = await service.get(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json(photo);
  } catch (err) {
    next(err);
  }
};

export const listPhotos = async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);
    const data = await service.list(page, pageSize);
    res.json({ page, pageSize, data });
  } catch (err) {
    next(err);
  }
};

export const updatePhoto = async (req, res, next) => {
  try {
    const updated = await service.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    await service.remove(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
