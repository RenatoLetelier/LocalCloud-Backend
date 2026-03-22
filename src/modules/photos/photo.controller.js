import { mediaFetch } from "../media/media.client.js";

export const listPhotos = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const upstream = await mediaFetch(`/media?type=photo&page=${page}&limit=${limit}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const getPhoto = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/${encodeURIComponent(req.params.filename)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const updatePhoto = async (req, res, next) => {
  try {
    const upstream = await mediaFetch("/media", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: req.params.filename, ...req.body }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(
      `/media/file/${encodeURIComponent(req.params.filename)}`,
      { method: "DELETE" }
    );
    if (upstream.status === 204) return res.status(204).send();
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};
