import { Readable } from "stream";
import { mediaFetch } from "./media.client.js";

/**
 * GET /api/media/file/:filename
 * Streams the file from the external media API directly to the client.
 */
export const streamFile = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(
      `/media/file/${encodeURIComponent(req.params.filename)}`
    );

    if (!upstream.ok) {
      const body = await upstream.json().catch(() => ({ message: "File not found" }));
      return res.status(upstream.status).json(body);
    }

    // Forward safe headers
    const forward = ["content-type", "content-length", "content-disposition", "accept-ranges"];
    for (const header of forward) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    res.status(upstream.status);
    Readable.fromWeb(upstream.body).pipe(res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/media/upload
 * Accepts a file via multipart/form-data (field name: "file") and proxies it
 * to the external media API's upload endpoint.
 */
export const uploadFile = async (req, res, next) => {
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

    const upstream = await mediaFetch("/media/upload", {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type — fetch sets the correct multipart boundary automatically
    });

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/media/deduplicate
 * Finds duplicate files in the external media API.
 */
export const deduplicateMedia = async (req, res, next) => {
  try {
    const upstream = await mediaFetch("/media/deduplicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body ?? {}),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};
