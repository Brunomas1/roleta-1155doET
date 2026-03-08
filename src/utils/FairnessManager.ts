/**
 * FairnessManager - Handles Provably Fair logic for the Roulette.
 * Uses SHA-256 to hash a Server Seed and combines it with a Client Seed.
 */
export class FairnessManager {
  /**
   * Generates a random string using CSPRNG.
   */
  static generateRandomSeed(length: number = 32): string {
    const array = new Uint8Array(length / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Computes SHA-256 hash of a string.
   */
  static async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derives a result index from seeds using HMAC-like hashing.
   * Result = Hash(ServerSeed + ClientSeed + Nonce) % itemsCount
   */
  static async deriveResult(serverSeed: string, clientSeed: string, nonce: number, count: number): Promise<number> {
    const combined = `${serverSeed}:${clientSeed}:${nonce}`;
    const hash = await this.sha256(combined);
    
    // Take the first 8 characters (32 bits) of the hash to get a stable number
    const hex = hash.substring(0, 8);
    const num = parseInt(hex, 16);
    
    return num % count;
  }
}
