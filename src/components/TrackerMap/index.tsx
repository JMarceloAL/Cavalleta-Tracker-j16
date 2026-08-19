import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';

import {
    Map,
    Marker,
    Camera,
    type CameraRef,
} from '@maplibre/maplibre-react-native';

import type { TrackerLocation } from '../../types/Tracker';
import { useTheme } from '../../contexts/ThemeContext';

import styles from './styles';

type Props = {
    location: TrackerLocation | null;
};

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY;

// Variantes claro/escuro do mesmo estilo "streets-v2" do MapTiler.
// Se "streets-v2-dark" não existir pra sua chave, confira os slugs
// disponíveis no seu painel MapTiler (cloud.maptiler.com) — outras
// opções comuns de tema escuro: "streets-v2-night" ou "basic-v2-dark".
const MAP_STYLE_LIGHT = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
const MAP_STYLE_DARK = `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`;

export default function TrackerMap({
    location,
}: Props) {
    const { isDark } = useTheme();
    const mapStyle = isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;

    const cameraRef = useRef<CameraRef>(null);
    const hasCenteredOnce = useRef(false);

    const lngLat = useMemo<[number, number]>(
        () => (location ? [location.longitude, location.latitude] : [0, 0]),
        [location]
    );

    useEffect(() => {
        if (!location) return;

        if (!hasCenteredOnce.current) {
            // Primeira vez: centraliza com zoom definido (via initialViewState do Camera)
            hasCenteredOnce.current = true;
            return;
        }

        // Atualizações seguintes: desliza suavemente até a nova posição.
        // Duração menor que o intervalo de polling (2s) para não acumular atraso.
        cameraRef.current?.easeTo({ center: lngLat, duration: 900 });
    }, [lngLat, location]);

    if (!location) {
        return <View style={{ flex: 1 }} />;
    }

    return (
        <Map style={{ flex: 1 }} mapStyle={mapStyle} androidView="texture" compass={false}>
            <Camera
                ref={cameraRef}
                initialViewState={{ center: lngLat, zoom: 15 }}
            />

            <Marker id="tracker" lngLat={lngLat}>
                <View style={styles.marker} />
            </Marker>
        </Map>
    );
}