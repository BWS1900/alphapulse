// AlphaPulse — Token Blacklist
// In-memory token blacklist for logout/revocation
// In production, use Redis or database for persistence

class TokenBlacklist {
  constructor() {
    this.blacklist = new Set();
    this.expiryTimes = new Map();

    // Cleanup expired tokens every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  add(token, expiresAt) {
    this.blacklist.add(token);
    if (expiresAt) {
      this.expiryTimes.set(token, new Date(expiresAt).getTime());
    }
  }

  has(token) {
    return this.blacklist.has(token);
  }

  remove(token) {
    this.blacklist.delete(token);
    this.expiryTimes.delete(token);
  }

  cleanup() {
    const now = Date.now();
    for (const [token, expiry] of this.expiryTimes.entries()) {
      if (expiry < now) {
        this.blacklist.delete(token);
        this.expiryTimes.delete(token);
      }
    }
  }

  get size() {
    return this.blacklist.size;
  }
}

// Singleton instance
module.exports = new TokenBlacklist();
