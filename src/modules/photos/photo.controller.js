import { Readable } from "stream";
import { mediaFetch } from "../media/media.client.js";

const STREAM_TIMEOUT_MS = 30_000;

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);
  try {
    const upstream = await mediaFetch(
      `/media/files/${encodeURIComponent(req.params.id)}/stream`,
      { signal: controller.signal }
    );
    clearTimeout(timer);

    if (!upstream.ok) {
      const body = await upstream.json().catch(() => ({ message: "File not found" }));
      return res.status(upstream.status).json(body);
    }

    const forward = ["content-type", "content-length", "content-disposition", "cache-control"];
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
