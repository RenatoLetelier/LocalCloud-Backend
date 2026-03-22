import { mediaFetch, getMediaBaseUrl } from "../media/media.client.js";
import { UserMediaRepository } from "../userMedia/userMedia.repository.js";
import { PhotoRepository } from "./photo.repository.js";

const userMediaRepo = new UserMediaRepository();
const photoRepo = new PhotoRepository();

// Extracts the items array from whatever shape the external API returns.
function extractItems(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.files)) return data.files;
  if (data && Array.isArray(data.items)) return data.items;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

// Merges media server data (source of truth for file info) with local DB
// data (source of truth for name, tags, metadata, etc.)
function mergePhoto(upstream, local) {
  if (!local) return upstream;
  return {
    ...upstream,
    name: local.name,
    description: local.description ?? undefined,
    albums: local.albums,
    tags: local.tags,
    visibility: local.visibility,
    metadata: local.metadata ?? undefined,
  };
}

export const listPhotos = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      const { page = 1, limit = 50, sort = "mtime", order = "desc" } = req.query;
      const upstream = await mediaFetch(
        `/media/files?sort=${sort}&order=${order}&page=${page}&limit=${limit}`
      );
      const data = await upstream.json();
      if (!upstream.ok) return res.status(upstream.status).json(data);

      const items = extractItems(data);
      const ids = items.map((f) => String(f.id));
      const locals = await photoRepo.findManyByPaths(ids);
      const localMap = Object.fromEntries(locals.map((l) => [l.path, l]));
      const files = items.map((item) => mergePhoto(item, localMap[String(item.id)]));

      return res.status(upstream.status).json(Array.isArray(data) ? files : { ...data, files });
    }

    // Regular users: filter by their assigned media IDs.
    const ownedIds = await userMediaRepo
      .findByUserAndType(req.user.id, "photo")
      .then((rows) => rows.map((r) => r.mediaId));

    if (ownedIds.length === 0) return res.json({ files: [], total: 0 });

    const upstream = await mediaFetch("/media/files?limit=9999&sort=mtime&order=desc");
    const data = await upstream.json();
    const idSet = new Set(ownedIds);
    const items = extractItems(data).filter((f) => idSet.has(String(f.id)));

    const locals = await photoRepo.findManyByPaths(items.map((f) => String(f.id)));
    const localMap = Object.fromEntries(locals.map((l) => [l.path, l]));
    const files = items.map((item) => mergePhoto(item, localMap[String(item.id)]));

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
    if (!upstream.ok) return res.status(upstream.status).json(data);

    const local = await photoRepo.findByPath(req.params.id);
    res.json(mergePhoto(data, local));
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

    // Persist extended metadata in local DB (upsert in case record doesn't exist yet).
    // We use the media server ID as the path key since that's the stable unique identifier.
    const { name, description, albums, tags, visibility, metadata } = req.body;
    const localUpdate = {};
    if (name        !== undefined) localUpdate.name        = name;
    if (description !== undefined) localUpdate.description = description;
    if (albums      !== undefined) localUpdate.albums      = albums;
    if (tags        !== undefined) localUpdate.tags        = tags;
    if (visibility  !== undefined) localUpdate.visibility  = visibility;
    if (metadata    !== undefined) localUpdate.metadata    = metadata;

    if (Object.keys(localUpdate).length > 0) {
      await photoRepo.upsertByPath(
        req.params.id,
        {
          path: req.params.id,
          name: name ?? req.params.id,
          description: description ?? null,
          albums: albums ?? [],
          tags: tags ?? [],
          visibility: visibility ?? "public",
          metadata: metadata ?? {},
          uploadedById: req.user.id,
        },
        localUpdate,
      );
    }

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
