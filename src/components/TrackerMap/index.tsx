import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
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

    /**
     * Quando true, a câmera acompanha automaticamente
     * as atualizações de localização (modo "seguir").
     *
     * Quando false, o mapa fica livre: o marcador
     * continua se movendo, mas a câmera não se mexe.
     */
    followEnabled?: boolean;

    /**
     * Disparado quando o próprio usuário arrasta/gesticula
     * no mapa (não dispara nos easeTo programáticos que
     * o componente faz sozinho).
     */
    onUserPanned?: () => void;
};

export type TrackerMapHandle = {
    /**
     * Centraliza a câmera imediatamente na posição atual
     * do rastreador. Usado pelo botão de recentralizar.
     */
    centerOnTracker: () => void;
};

/**
 * IMPORTANTE: os tipos <TrackerMapHandle, Props> NÃO são passados
 * como argumentos genéricos explícitos pro forwardRef aqui —
 * em arquivos .tsx isso pode confundir o parser do TypeScript
 * (ele tenta interpretar como JSX). Em vez disso, tipamos os
 * próprios parâmetros da função (props e ref) e deixamos o TS
 * inferir os genéricos sozinho.
 */
const TrackerMap = forwardRef(function TrackerMap(
    {
        location,
        routePoints = [],
        followEnabled = true,
        onUserPanned,
    }: Props,
    ref: React.Ref<TrackerMapHandle>
) {
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
     * MÉTODO EXPOSTO AO MAPSCREEN (botão recentralizar)
     * ============================================================
     */

    useImperativeHandle(
        ref,
        () => ({
            centerOnTracker: () => {
                if (!location) {
                    return;
                }

                cameraRef.current?.easeTo({
                    center: lngLat,
                    duration: 600,
                });
            },
        }),
        [location, lngLat]
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
     * CENTRALIZAÇÃO AUTOMÁTICA (MODO SEGUIR)
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
         * Só acompanha automaticamente se o modo
         * "seguir" estiver ativo. Se o usuário tiver
         * soltado o mapa (followEnabled = false),
         * a câmera fica parada e só o marcador se move.
         */
        if (!followEnabled) {
            return;
        }

        cameraRef.current?.easeTo({
            center: lngLat,
            duration: 900,
        });
    }, [
        lngLat,
        location,
        followEnabled,
    ]);

    /*
     * ============================================================
     * DETECTA GESTO DO USUÁRIO NO MAPA
     * ============================================================
     *
     * onRegionDidChange dispara tanto quando NÓS movemos a
     * câmera (easeTo) quanto quando o USUÁRIO arrasta o mapa.
     * O campo properties.isUserInteraction diferencia os dois
     * casos — só nos importa quando for true.
     */

    function handleRegionDidChange(event: any) {
        const isUserInteraction =
            event?.properties?.isUserInteraction;

        if (isUserInteraction) {
            onUserPanned?.();
        }
    }

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

            onRegionDidChange={
                handleRegionDidChange
            }
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
});

const MAPTILER_KEY =
    process.env.EXPO_PUBLIC_MAPTILER_KEY;

const MAP_STYLE_LIGHT =
    `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

const MAP_STYLE_DARK =
    `https://api.maptiler.com/maps/streets-v2-dark/style.json?key=${MAPTILER_KEY}`;

export default TrackerMap;