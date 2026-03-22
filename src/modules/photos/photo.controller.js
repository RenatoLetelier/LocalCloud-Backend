import { mediaFetch, getMediaBaseUrl } from "../media/media.client.js";
import { UserMediaRepository } from "../userMedia/userMedia.repository.js";

const userMediaRepo = new UserMediaRepository();

// Extracts the items array from whatever shape the external API returns.
function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.files)) return data.files;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export const listPhotos = async (req, res, next) => {
  try {
    // Admins see everything — proxy through unchanged.
    if (req.user.role === "admin") {
      const { page = 1, limit = 50, sort = "mtime", order = "desc" } = req.query;
      const upstream = await mediaFetch(
        `/media/files?sort=${sort}&order=${order}&page=${page}&limit=${limit}`
      );
      const data = await upstream.json();
      return res.status(upstream.status).json(data);
    }

    // Regular users: filter by their assigned media IDs.
    const ownedIds = await userMediaRepo
      .findByUserAndType(req.user.id, "photo")
      .then((rows) => rows.map((r) => r.mediaId));

    if (ownedIds.length === 0) {
      return res.json({ files: [], total: 0 });
    }

    // Fetch everything and filter client-side.
    const upstream = await mediaFetch("/media/files?limit=9999&sort=mtime&order=desc");
    const data = await upstream.json();
    const idSet = new Set(ownedIds);
    const files = extractItems(data).filter((f) => idSet.has(String(f.id)));

    res.json({ files, total: files.length });
  } catch (err) {
    next(err);
  }
};

export const getPhoto = async (req, res, next) => {
  try {
    // Non-admins: verify ownership before proxying.
    if (req.user.role !== "admin") {
      const record = await userMediaRepo.findByUserAndMediaId(req.user.id, req.params.id);
      if (!record) return res.status(403).json({ message: "Forbidden" });
    }

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
