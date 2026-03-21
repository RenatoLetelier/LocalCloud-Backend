import { TunnelService } from "./tunnel.service.js";

const service = new TunnelService();

export const getTunnel = async (req, res, next) => {
  try {
    const config = await service.get();
    if (!config) return res.status(404).json({ message: "Tunnel URL not set" });
    res.json(config);
  } catch (err) {
    next(err);
  }
};

export const setTunnel = async (req, res, next) => {
  try {
    const config = await service.set(req.body.url, req.body.cdnUrl);
    res.json(config);
  } catch (err) {
    next(err);
  }
};
