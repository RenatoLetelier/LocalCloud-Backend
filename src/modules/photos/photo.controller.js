import { mediaFetch, getMediaBaseUrl } from "../media/media.client.js";

export const listPhotos = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, sort = "mtime", order = "desc" } = req.query;
    const upstream = await mediaFetch(
      `/media/files?sort=${sort}&order=${order}&page=${page}&limit=${limit}`
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const getPhoto = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/files/${encodeURIComponent(req.params.id)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const streamPhoto = async (req, res, next) => {
  try {
    const baseUrl = await getMediaBaseUrl();
    res.redirect(`${baseUrl}/media/files/${encodeURIComponent(req.params.id)}/stream`);
  } catch (err) {
    next(err);
  }
};

export const updatePhoto = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/files/${encodeURIComponent(req.params.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
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
      `/media/files/${encodeURIComponent(req.params.id)}`,
      { method: "DELETE" }
    );
    if (upstream.status === 204) return res.status(204).send();
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};
