# Apple Notification Center Service notifications app

A 240x320 Moddable Piu notification viewer for Apple Notification Center Service (ANCS). New iPhone notifications are
added at the top of a scrollable stack. Green and red buttons send the notification's ANCS positive and negative actions
when those actions are available. Buttons use the action label supplied by iOS when it fits, with `+` and `x` fallbacks.
Each card shows the local time when the notification was received.
The header shows the current local time beside the BLE connection icon.

The simulator uses a mock notification service so the complete UI and dismissal flow can be tested without BLE
hardware. ESP32 builds use the reusable [`modules/ancs`](../../modules/ancs/) implementation for pairing, reconnects,
notification retrieval, app-name caching, and actions.

## Simulator

Build from the repository root:

```sh
npm run build:ancs:sim
```

To start the debugger:

```sh
npm run debug:ancs:sim
```

The mock connects automatically, adds sample notifications over time, and adds another notification every seven
seconds. Tap a green or red action button to verify that an actionable notification is removed. A gray button indicates
that the source notification did not expose that action.

Received and updated notification attributes, dismissal requests, and removals are written to the debugger log.

## ESP32

ANCS requires an ESP32 target with BLE support. Build and run from this example directory:

```sh
mcconfig -d -m -p esp32/moddable_two
```

Open **Settings > Bluetooth** on the iPhone and pair with **Moddable Notifications**. After the client reconnects, allow
notification sharing if iOS asks. Incoming and modified notifications then appear in the app.

The app never performs an action automatically by default. Tapping an enabled action button explicitly invokes
`ANCSService.performAction(uid, action)`. Not every notification exposes both actions, and the notification remains
visible until iOS reports that it was removed or modified.

For unattended hardware testing only, an explicit build setting can act on each supported notification:

```sh
mcconfig -d -m -p esp32/moddable_two ancsAction=positive
mcconfig -d -m -p esp32/moddable_two ancsAction=negative
```

## Application data flow

```mermaid
sequenceDiagram
    participant Source as iPhone or mock
    participant Service as NotificationServiceProvider
    participant Controller as NotificationsController.ts
    participant Model as NotificationModel.ts
    participant View as Piu components

    Source->>Service: Notification added, updated, or removed
    Service->>Controller: onServiceUpdate(update)
    Controller->>Model: applyServiceUpdate(model, update)
    Controller->>View: onModelChanged(model)
    View->>Controller: User taps dismiss
    Controller->>Service: performAction(uid, action)
```
