/// <reference types="vite/client" />



// Grist Plugin API types
interface Window {
  grist?: GristAPI;
}

interface GristAPI {
  ready(options?: string): void;
  docApi: GristDocAPI;
}

interface GristDocAPI {
  fetchTable(tableId: string): Promise<Record<string, unknown[]>>;
}