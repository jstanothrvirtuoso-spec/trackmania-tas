declare global {
  interface Window {
    extractInputsFromBytes: (
      bytes: Uint8Array,
      options?: {
        decimal?: boolean;
        relative?: boolean;
        separate?: boolean;
      }
    ) => unknown;
  }
}

export {};