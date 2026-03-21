import { Readable } from "stream";
import { mediaFetch } from "../media/media.client.js";

const STREAM_TIMEOUT_MS = 30_000;

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

// Streams HLS segments, playlists, subtitles, etc.
// Route: GET /api/videos/:id/stream/*
export const streamVideo = async (req, res, next) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
  try {
    const subpath = req.params[0] || "";
    const upstreamHeaders = {};
    if (req.headers.range) upstreamHeaders["Range"] = req.headers.range;

    const upstream = await mediaFetch(
      `/media/videos/${encodeURIComponent(req.params.id)}/stream/${subpath}`,
      { headers: upstreamHeaders, signal: controller.signal }
    );
    clearTimeout(timer);

    if (!upstream.ok && upstream.status !== 206) {
      const body = await upstream.json().catch(() => ({ message: "File not found" }));
      return res.status(upstream.status).json(body);
    }

    const forward = [
      "content-type", "content-length", "content-range",
      "accept-ranges", "content-disposition", "cache-control",
    ];
    for (const header of forward) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    res.status(upstream.status);
    const stream = Readable.fromWeb(upstream.body);
    stream.on("error", () => { if (!res.writableEnded) res.destroy(); });
    stream.pipe(res);
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return res.status(504).json({ message: "Media API timed out" });
    }
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
    const data = await upstream.json();
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
