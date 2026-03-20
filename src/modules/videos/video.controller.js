import { mediaFetch } from "../media/media.client.js";

export const listVideos = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const upstream = await mediaFetch(`/media?type=video&page=${page}&limit=${limit}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/${encodeURIComponent(req.params.filename)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const upstream = await mediaFetch("/media", {
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

export const deleteVideo = async (req, res, next) => {
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
