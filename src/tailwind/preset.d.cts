declare namespace preset {
  interface HexaPresetOptions {
    /** true: add brand colours alongside Tailwind's defaults. Default (false): replace the palette. */
    extend?: boolean;
  }
  interface HexaTailwindPreset {
    theme: {
      colors?: Record<string, unknown>;
      extend: Record<string, unknown>;
    };
  }
}

declare const preset: preset.HexaTailwindPreset & {
  readonly createPreset: (options?: preset.HexaPresetOptions) => preset.HexaTailwindPreset;
};

export = preset;
