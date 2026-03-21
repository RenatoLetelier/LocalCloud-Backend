import { mediaFetch, getMediaBaseUrl } from "./media.client.js";

/**
 * GET /api/health
 * Proxies the health check from the external media API (public, no auth required).
 */
export const getHealth = async (req, res, next) => {
  let baseUrl;
  try {
    baseUrl = await getMediaBaseUrl();
  } catch (err) {
    return res.status(err.status ?? 503).json({ message: err.message });
  }
  try {
    const upstream = await fetch(`${baseUrl}/health`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch {
    res.status(502).json({ message: "Could not reach Media API" });
  }
};

/**
 * POST /api/media/upload
 * Accepts a photo via multipart/form-data (field name: "files") and proxies it
 * to the external media API's upload endpoint.
 */
export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided. Use field name 'files'" });
    }

    const formData = new FormData();
    formData.append(
      "files",
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    );

    const upstream = await mediaFetch("/media/upload", {
      method: "POST",
      body: formData,
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
