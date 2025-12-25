# Namespaces and Classes in TypeScript

This doc replaces engine-specific namespace notes with TypeScript module conventions.

## Module Layout

- Use folders as module boundaries (e.g., `src/sim`, `src/ui`, `src/data`).
- Export explicit types and functions; avoid hidden globals.
- Keep data models separate from UI adapters.

## Example: Chart Entry Model

```ts
export interface ChartEntry {
  country: string;
  position: number;
  songTitle: string;
  albumTitle: string;
  isSingle: boolean;
}

export const deriveAlbumTitle = (entry: ChartEntry): string => {
  return entry.isSingle ? `${entry.songTitle} - Single` : entry.albumTitle;
};
```

## Guidance

- Prefer `interface` for data shapes and `type` for unions.
- Avoid class inheritance for data records; keep records plain and serializable.
- Keep modules small to prevent circular imports.
