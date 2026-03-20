import { Readable } from "stream";
import { mediaFetch } from "./media.client.js";

const STREAM_TIMEOUT_MS = 30_000; // 30 s — abort if upstream doesn't respond in time

/**
 * GET /api/media/file/:filename
 * Streams the file from the external media API directly to the client.
 * Forwards Range headers so browsers can seek videos and buffer efficiently.
 */
export const streamFile = async (req, res, next) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const upstreamHeaders = {};

    // Forward Range header — essential for video seeking and chunked buffering
    if (req.headers.range) {
      upstreamHeaders["Range"] = req.headers.range;
    }

    const upstream = await mediaFetch(
      `/media/file/${encodeURIComponent(req.params.filename)}`,
      { headers: upstreamHeaders, signal: controller.signal }
    );

    clearTimeout(timer);

    if (!upstream.ok && upstream.status !== 206) {
      const body = await upstream.json().catch(() => ({ message: "File not found" }));
      return res.status(upstream.status).json(body);
    }

    // Forward headers the browser needs for proper media playback
    const forward = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "content-disposition",
    ];
    for (const header of forward) {
      const value = upstream.headers.get(header);
      if (value) res.setHeader(header, value);
    }

    res.status(upstream.status);

    const stream = Readable.fromWeb(upstream.body);

    // Handle errors that occur after headers are already sent (mid-stream)
    stream.on("error", () => {
      if (!res.writableEnded) res.destroy();
    });

    stream.pipe(res);
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      return res.status(504).json({ message: "Media API timed out" });
    }
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
