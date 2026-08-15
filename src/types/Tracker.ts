

export interface Tracker {
    id: string;
    name: string;
    phone: string;
    imei?: string; // necessário para localização em tempo real via API
}

export interface TrackerLocation {
    latitude: number;
    longitude: number;
    speed?: number;
    satellites?: number;
    battery?: number;
    lastUpdate?: string;
}