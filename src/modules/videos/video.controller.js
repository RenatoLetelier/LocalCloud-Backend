import { mediaFetch, getMediaToken, getMediaBaseUrl } from "../media/media.client.js";
import { UserMediaRepository } from "../userMedia/userMedia.repository.js";

const userMediaRepo = new UserMediaRepository();

// Extracts the items array from whatever shape the external API returns.
function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.videos)) return data.videos;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export const listVideos = async (req, res, next) => {
  try {
    // Admins see everything — proxy through unchanged.
    if (req.user.role === "admin") {
      const { page = 1, limit = 20, sort = "mtime", order = "desc" } = req.query;
      const upstream = await mediaFetch(
        `/media/videos?sort=${sort}&order=${order}&page=${page}&limit=${limit}`
      );
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

    // Regular users: filter by their assigned media IDs.
    const ownedIds = await userMediaRepo
      .findByUserAndType(req.user.id, "video")
      .then((rows) => rows.map((r) => r.mediaId));

    if (ownedIds.length === 0) {
      return res.json({ videos: [], total: 0 });
    }

    // Fetch everything and filter client-side.
    const upstream = await mediaFetch("/media/videos?limit=9999&sort=mtime&order=desc");
    const data = await upstream.json();
    const idSet = new Set(ownedIds);
    const videos = extractItems(data).filter((v) => idSet.has(String(v.id)));

    res.json({ videos, total: videos.length });
  } catch (err) {
    next(err);
  }
};

export const getVideo = async (req, res, next) => {
  try {
    // Non-admins: verify ownership before proxying.
    if (req.user.role !== "admin") {
      const record = await userMediaRepo.findByUserAndMediaId(req.user.id, req.params.id);
      if (!record) return res.status(403).json({ message: "Forbidden" });
    }

    const upstream = await mediaFetch(`/media/videos/${encodeURIComponent(req.params.id)}`);
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

// Redirects HLS requests (segments, playlists, subtitles) to the media API.
// Route: GET /api/videos/:id/stream/*splat
export const streamVideo = async (req, res, next) => {
  try {
    const baseUrl = await getMediaBaseUrl();
    const subpath = req.params.splat || "";
    res.redirect(`${baseUrl}/media/videos/${encodeURIComponent(req.params.id)}/stream/${subpath}`);
  } catch (err) {
    next(err);
  }
};

export const thumbnailVideo = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      const record = await userMediaRepo.findByUserAndMediaId(req.user.id, req.params.id);
      if (!record) return res.status(403).json({ message: "Forbidden" });
    }
    const baseUrl = await getMediaBaseUrl();
    res.redirect(`${baseUrl}/media/videos/${encodeURIComponent(req.params.id)}/thumbnail`);
  } catch (err) {
    next(err);
  }
};

export const getUploadToken = async (req, res, next) => {
  try {
    const { token, uploadUrl } = await getMediaToken();
    res.json({
      token,
      uploadUrl: `${uploadUrl}/media/videos/upload`,
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

    if (upstream.ok || upstream.status === 204) {
      // Delete thumbnail in parallel with DB cleanup — ignore 404 if already gone
      await Promise.all([
        userMediaRepo.deleteByMediaId(req.params.id),
        mediaFetch(`/media/videos/${encodeURIComponent(req.params.id)}/thumbnail`, { method: "DELETE" })
          .catch(() => {}),
      ]);
      return res.status(204).send();
    }

    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteThumbnailVideo = async (req, res, next) => {
  try {
    const upstream = await mediaFetch(
      `/media/videos/${encodeURIComponent(req.params.id)}/thumbnail`,
      { method: "DELETE" }
    );
    if (upstream.status === 204 || upstream.status === 404) return res.status(204).send();
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    next(err);
  }
};
