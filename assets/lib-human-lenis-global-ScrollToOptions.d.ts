declare global {
  interface ScrollToOptions {
    /**
     * Custom option for bypassing lenis scroll propagation. Used for
     * virtual-only scrolls that don't require immediately updating lenis,
     * usually same-tick set & resets.
     */
    bypass?: boolean;
  }
}

export {};
