# AMS Media Player Agent Guide

These instructions apply only to `examples/ams-media-player/`.

## Boundaries

- Keep Piu UI code in `View.ts` and `components/`.
- Keep media-player adapters, HTTP, TLS, and artwork fetching in `services/`.
- Keep reusable AMS BLE and pairing logic in `../../modules/ams/`.
- Keep playback state centralized in `model.ts`.
- Route user input through `Controller.ts`; components must not call services directly.
- Treat `MusicPlayerService.ts` as the common player contract.
- Use `MockMusicPlayerService` for simulator builds and `AMSMusicPlayerService` only for ESP32 builds.
- Do not include the AMS module in the simulator platform path.
- Decode artwork JPEG data only in `components/Artwork.ts` with `commodetto/loadJPEG` and Piu `ImageBuffer`.

## Responsibilities

- `main.ts` creates the model, service provider, controller, and application.
- `Controller.ts` merges service updates, forwards commands, and starts artwork fetches when track identity changes.
- `View.ts` distributes model changes to screen components.
- `services/AMSMusicPlayerService.ts` adapts the reusable AMS module to the media-player model.
- `services/ArtworkProvider.ts` performs iTunes lookup and JPEG download and must not import Piu.
- `components/Artwork.ts` displays already-fetched artwork and must not fetch it.

## References

- `$(MODDABLE)/examples/io/imagein/camera/camera-test/main.js`
- `$(MODDABLE)/modules/piu/MC/imageBuffer`
- `$(MODDABLE)/modules/commodetto/commodettoLoadJPEG.js`
