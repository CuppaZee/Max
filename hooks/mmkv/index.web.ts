import { MMKVConfiguration, MMKVInterface } from "react-native-mmkv";

const simpleHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash; // Convert to 32bit integer
  }
  return new Uint32Array([hash])[0].toString(36);
};

export class MMKV implements MMKVInterface {
  private id: string;
  private hash: string;
  private generateLocalStorageKey(key: string) {
    return `${this.id}~~${key}~~${this.hash}`;
  }
  
  constructor(configuration?: MMKVConfiguration) {
    if (configuration?.encryptionKey) {
      console.warn("MMKV encryptionKey property is not supported on Web.");
    }
    if (configuration?.path) {
      console.warn("MMKV path property is not supported on Web.");
    }
    this.id = configuration?.id ?? "default";
    this.hash = simpleHash(this.id);
  }
  set(key: string, value: boolean | string | number): void {
    localStorage.setItem(this.generateLocalStorageKey(key), value.toString());
  };
  getBoolean(key: string): boolean {
    return Boolean(localStorage.getItem(this.generateLocalStorageKey(key)) ?? false);
  };
  getString(key: string): string | undefined {
    return localStorage.getItem(this.generateLocalStorageKey(key)) ?? undefined;
  };
  getNumber(key: string): number {
    return Number(localStorage.getItem(this.generateLocalStorageKey(key)) ?? 0);
  };
  delete(key: string): void {
    return localStorage.removeItem(this.generateLocalStorageKey(key));
  };
  getAllKeys(): string[] {
    return Object.keys(localStorage).filter(
      i => i.startsWith(`${this.id}~~`) && i.endsWith(`~~${this.hash}`)
    ).map(i => i.slice(this.id.length + 2, -this.hash.length - 2));
  };
  clearAll(): void {
    this.getAllKeys().forEach(key => {
      this.delete(key);
    });
  };
}