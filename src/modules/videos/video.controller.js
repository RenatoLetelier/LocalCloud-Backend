import { Readable } from "stream";
import { mediaFetch, getMediaToken, getMediaCdnUrl } from "../media/media.client.js";

export const listVideos = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, sort = "mtime", order = "desc" } = req.query;
    const upstream = await mediaFetch(
      `/media/videos?sort=${sort}&order=${order}&page=${page}&limit=${limit}`
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/videos/${encodeURIComponent(req.params.id)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

// Redirects HLS requests (segments, playlists, subtitles) to the CDN.
// Route: GET /api/videos/:id/stream/*splat
export const streamVideo = async (req, res, next) => {
  try {
    const cdnUrl = await getMediaCdnUrl();
    const subpath = req.params.splat || "";
    res.redirect(`${cdnUrl}/media/videos/${encodeURIComponent(req.params.id)}/stream/${subpath}`);
  } catch (err) {
    next(err);
  }
};

export const getUploadToken = async (req, res, next) => {
  try {
    const { token, baseUrl } = await getMediaToken();
    res.json({
      token,
      uploadUrl: `${baseUrl}/media/videos/upload`,
    });
  } catch (err) {
    next(err);
  }
};

export const uploadVideo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided. Use field name 'file'" });
    }
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    );
    if (req.body.name) formData.append("name", req.body.name);

    const upstream = await mediaFetch("/media/videos/upload", {
      method: "POST",
      body: formData,
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { message: text || "Upload complete" }; }
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const addVideoFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    );
    if (req.body.path) formData.append("path", req.body.path);

    const upstream = await mediaFetch(
      `/media/videos/${encodeURIComponent(req.params.id)}/files`,
      { method: "POST", body: formData }
    );
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(`/media/videos/${encodeURIComponent(req.params.id)}`, {
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
      `/media/videos/${encodeURIComponent(req.params.id)}`,
      { method: "DELETE" }
    );
    if (upstream.status === 204) return res.status(204).send();
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};
