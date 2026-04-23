

## Acrylic Wall Clock video load fix

The "Acrylic Wall Clock" section on `/category/acrylic` shows an empty video box (visible in your screenshot). The video file (`wall-clock-showcase.mp4`) is ~10MB and is failing to start because:

1. The `<video>` tag has no `preload`, no `onError`/`onLoadedData` hooks, and no poster — so when the asset is slow or blocked, the user sees a blank frame.
2. Browsers often block `autoPlay` until the video has enough buffered data; without `preload="auto"` on a large file behind a CDN path, playback never kicks in.
3. There is no fallback image while the video downloads, so users see an empty container.

### Changes

**1. `src/pages/AcrylicCategory.tsx` — Make the showcase video load reliably**
- Add `preload="auto"` and a `poster` (use `acrylicWall` image as a poster fallback so something always shows immediately).
- Add `onLoadedData` handler that calls `play().catch(...)` to force playback once buffered (handles autoplay rejection on some browsers).
- Add `onError` fallback that swaps to a still image so the slot is never empty.
- Add explicit `width/height` style and a min-height on the wrapper so the layout doesn't collapse before the video paints.
- Track per-showcase loading state and show a subtle loading shimmer over the poster until first frame is ready.
- Add a `key={showcase.id}` on the `<video>` so React doesn't reuse a stale element across re-renders.

**2. Bonus: optimize all 4 showcase videos in the same loop**
- All 4 showcases (Wall Photo, Wall Clock, Framed, Baby Frames) use the same pattern, so the same fix applies to each — they will all load faster and degrade gracefully.

**3. Fix unrelated TypeScript build error blocking the project**
- `supabase/functions/send-admin-reset-email/index.ts` line 145: `error.message` errors because `error` is typed as `unknown`. Change to `error instanceof Error ? error.message : String(error)`.

### Technical details

```text
Acrylic Wall Clock showcase
┌────────────────────────────────────────────┐
│ Before: <video src=... autoPlay muted/>    │  ← empty if slow/blocked
│                                            │
│ After:                                     │
│  <video                                    │
│    src=... poster={fallbackImg}            │
│    preload="auto" autoPlay loop muted      │
│    playsInline                             │
│    onLoadedData={() => v.play().catch()}   │
│    onError={() => setFailed(true)}         │
│  />                                        │
│  {failed && <img src={fallbackImg}/>}      │
└────────────────────────────────────────────┘
```

No new dependencies. No DB changes. Video asset itself stays the same.

