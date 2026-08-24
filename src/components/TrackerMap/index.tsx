import React, {
    useEffect,
    useMemo,
    useRef,
} from 'react';

import {
    View,
} from 'react-native';

import {
    Map,
    Marker,
    Camera,
    GeoJSONSource,
    Layer,
    type CameraRef,
} from '@maplibre/maplibre-react-native';

import type {
    TrackerLocation,
} from '../../types/Tracker';

import {
    useTheme,
} from '../../contexts/ThemeContext';

import {
    styles,
} from './styles';

type RoutePoint =
    TrackerLocation;

type Props = {
    location:
    TrackerLocation | null;

    routePoints?:
    RoutePoint[];
};

const MAPTILER_KEY =
    process.env.EXPO_PUBLIC_MAPTILER_KEY;

const MAP_STYLE_LIGHT =
    `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const MAP_STYLE_DARK =
    `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`;

export default function TrackerMap({
    location,
    routePoints = [],
}: Props) {
    const {
        isDark,
    } = useTheme();

    const mapStyle =
        isDark
            ? MAP_STYLE_DARK
            : MAP_STYLE_LIGHT;

    const cameraRef =
        useRef<CameraRef>(null);

    const hasCenteredOnce =
        useRef(false);

    /*
     * ============================================================
     * COORDENADAS DO MARCADOR ATUAL
     * ============================================================
     */

    const lngLat =
        useMemo<[number, number]>(
            () =>
                location
                    ? [
                        location.longitude,
                        location.latitude,
                    ]
                    : [0, 0],
            [location]
        );

    /*
     * ============================================================
     * GEOJSON DA ROTA
     * ============================================================
     */

    const routeGeoJson =
        useMemo(() => {
            const validPoints =
                routePoints.filter(
                    point =>
                        Number.isFinite(
                            point.latitude
                        ) &&
                        Number.isFinite(
                            point.longitude
                        )
                );

            /*
             * Adiciona a localização atual
             * caso ainda não esteja no array.
             */
            if (
                location &&
                Number.isFinite(
                    location.latitude
                ) &&
                Number.isFinite(
                    location.longitude
                )
            ) {
                const last =
                    validPoints[
                    validPoints.length - 1
                    ];

                const alreadyExists =
                    last &&
                    last.latitude ===
                    location.latitude &&
                    last.longitude ===
                    location.longitude;

                if (!alreadyExists) {
                    validPoints.push(
                        location
                    );
                }
            }

            return {
                type: 'Feature' as const,

                properties: {},

                geometry: {
                    type: 'LineString' as const,

                    coordinates:
                        validPoints.map(
                            point => [
                                point.longitude,
                                point.latitude,
                            ]
                        ),
                },
            };
        }, [
            routePoints,
            location,
        ]);

    /*
     * ============================================================
     * CENTRALIZAÇÃO
     * ============================================================
     */

    useEffect(() => {
        if (!location) {
            return;
        }

        if (
            !hasCenteredOnce.current
        ) {
            hasCenteredOnce.current =
                true;

            return;
        }

        /*
         * Atualizações seguintes:
         * movimentação suave.
         */
        cameraRef.current?.easeTo({
            center: lngLat,
            duration: 900,
        });
    }, [
        lngLat,
        location,
    ]);

    /*
     * ============================================================
     * SEM LOCALIZAÇÃO
     * ============================================================
     */

    if (!location) {
        return (
            <View
                style={{
                    flex: 1,
                }}
            />
        );
    }

    /*
     * ============================================================
     * MAPA
     * ============================================================
     */

    return (
        <Map
            style={{
                flex: 1,
            }}

            mapStyle={
                mapStyle
            }

            androidView="texture"

            compass={false}
        >
            <Camera
                ref={cameraRef}

                initialViewState={{
                    center: lngLat,

                    zoom: 15,
                }}
            />

            {/*
             * ====================================================
             * LINHA DA ROTA
             * ====================================================
             *
             * Na v11, ShapeSource virou GeoJSONSource (prop "shape"
             * virou "data"), e LineLayer virou <Layer type="line">.
             */}

            {routeGeoJson.geometry.coordinates.length >=
                2 && (
                    <GeoJSONSource
                        id="route-source"

                        data={
                            routeGeoJson
                        }
                    >
                        <Layer
                            type="line"

                            id="route-line"

                            layout={{
                                'line-cap':
                                    'round',

                                'line-join':
                                    'round',
                            }}

                            paint={{
                                'line-color':
                                    isDark
                                        ? '#A3CC7F'
                                        : '#1E90FF',

                                'line-width':
                                    5,

                                'line-opacity':
                                    0.9,
                            }}
                        />
                    </GeoJSONSource>
                )}

            {/*
             * ====================================================
             * MARCADOR DO RASTREADOR
             * ====================================================
             */}

            <Marker
                id="tracker"

                lngLat={
                    lngLat
                }
            >
                <View
                    style={
                        styles.marker
                    }
                />
            </Marker>
        </Map>
    );
}