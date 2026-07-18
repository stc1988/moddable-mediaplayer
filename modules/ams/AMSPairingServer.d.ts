interface AMSPairingServerOptions {
	deviceName?: string;
	advertisedDeviceName?: string;
	batteryLevel?: number;
	onPaired?(address: unknown): void;
}

declare class AMSPairingServer {
	constructor(options?: AMSPairingServerOptions);
}

export default AMSPairingServer;
export type { AMSPairingServerOptions };
