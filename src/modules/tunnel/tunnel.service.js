import { TunnelRepository } from "./tunnel.repository.js";

export class TunnelService {
  constructor(repo = new TunnelRepository()) {
    this.repo = repo;
  }

  get() {
    return this.repo.get();
  }

  set(url, cdnUrl) {
    return this.repo.set(url, cdnUrl);
  }
}
