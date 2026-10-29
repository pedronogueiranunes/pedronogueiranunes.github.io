# Portrait source archive

On 2026-10-29 Pedro approved the 1.77 MB, 92,371-splat SH1 variant after comparing the local SOG compression laboratory. Both Home and About use `public/assets/pedro-head-92k.sog` through the shared splat initializer. A new filename prevents reuse of stale cached source data.

## Original backup

`pedro-head-original-184741.sog`: exact copy of the previous `public/assets/pedro-head.sog`; 2,688,043 bytes, 184,741 splats, SH1.

SHA-256: `e022596e7f765c8a900e0783475bc93df1972ab359ce4693a860440d0e6c8dee`.

The backup is stored under docs rather than public so it is retained in Git without being copied into the deployed asset directory. The existing compressed PLY remains the runtime failure fallback.

## Approved runtime

`public/assets/pedro-head-92k.sog`: 1,767,123 bytes, 92,371 splats, SH1. Saved 920,920 bytes (34.3%) of source asset data. This does not imply the same reduction in GPU time or GPU memory.

SHA-256: `cb42136b50e6ff248eee73b72324cd315b75faebb77261875458c6b839dcd737`.

Generated using @playcanvas/splat-transform 3.4.1, Node 22, CPU:

```
splat-transform -g cpu original.sog --decimate 50% half.ply
splat-transform -g cpu half.ply half.sog
```

The runtime keeps the original measured center (-0.01384061574935913, -0.3027264475822449, 0.009611845016479492) and radius (0.3904232457799805), matching the approved comparison. That preserves portrait framing and orbit sizing instead of reframing from the slightly different decimated bounds. Existing interaction, lazy loading, visibility, reduced-motion and failure behaviors are retained.

To restore the original, copy the archived file to the public asset directory, update the initializer URL, and remove the approved-SOG framing override if using a different source model. Do not remove this archive when cleaning deployed assets.
