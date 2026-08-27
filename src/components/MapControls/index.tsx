// src/components/MapControls/index.tsx

import React from 'react';

import {
    View,
    TouchableOpacity,
    Switch,
    ActivityIndicator,
} from 'react-native';

import {
    Ionicons,
} from '@expo/vector-icons';

import FontAwesome from '@expo/vector-icons/FontAwesome';

import Octicons from '@expo/vector-icons/Octicons';

import {
    styles,
} from './styles';

type Props = {

    onOpenExternalMap: () => void;

    onShowLastLocation: () => void;

    onRequestSmsLocation: () => void;

    smsLoading: boolean;

    realTimeEnabled: boolean;

    onToggleRealTime: (
        value: boolean
    ) => void;

    checkingRealTime?: boolean;

    realTimeDisabled?: boolean;

    /**
     * ========================================================
     * MODO VIGILANTE
     * ========================================================
     */

    vigilanteEnabled: boolean;

    onToggleVigilante: (
        value: boolean
    ) => void;

    checkingVigilante?: boolean;

    vigilanteDisabled?: boolean;
};

export default function MapControls({

    onOpenExternalMap,

    onShowLastLocation,

    onRequestSmsLocation,

    smsLoading,

    realTimeEnabled,

    onToggleRealTime,

    checkingRealTime = false,

    realTimeDisabled = false,

    vigilanteEnabled,

    onToggleVigilante,

    checkingVigilante = false,

    vigilanteDisabled = false,

}: Props) {

    return (

        <View
            style={
                styles.container
            }
        >

            {/* ==================================================
                TEMPO REAL
            ================================================== */}

            <View
                style={
                    styles.switchWrapper
                }
            >

                <Ionicons

                    name="radio-outline"

                    size={25}

                    color={
                        realTimeEnabled
                            ? 'rgb(163, 204, 127)'
                            : '#999'
                    }

                    style={
                        styles.signalIcon
                    }
                />

                {checkingRealTime ? (
                    <ActivityIndicator
                        size="small"
                        color="rgb(163, 204, 127)"
                        style={styles.switch}
                    />
                ) : (
                    <Switch

                        style={
                            styles.switch
                        }

                        value={
                            realTimeEnabled
                        }

                        onValueChange={
                            onToggleRealTime
                        }

                        disabled={
                            checkingRealTime ||
                            realTimeDisabled
                        }
                    />
                )}

            </View>

            {/* ==================================================
                MODO VIGILANTE
            ================================================== */}

            <View
                style={
                    styles.vigilanteSwitchWrapper
                }
            >

                <Ionicons

                    name="shield-checkmark-outline"

                    size={25}

                    color={
                        vigilanteEnabled
                            ? 'rgb(163, 204, 127)'
                            : '#999'
                    }

                    style={
                        styles.signalIcon
                    }
                />

                {checkingVigilante ? (
                    <ActivityIndicator
                        size="small"
                        color="rgb(163, 204, 127)"
                        style={styles.switch}
                    />
                ) : (
                    <Switch

                        style={
                            styles.switch
                        }

                        value={
                            vigilanteEnabled
                        }

                        onValueChange={
                            onToggleVigilante
                        }

                        disabled={
                            checkingVigilante ||
                            vigilanteDisabled
                        }
                    />
                )}

            </View>

            {/* ==================================================
                HISTÓRICO
            ================================================== */}

            <TouchableOpacity

                style={
                    styles.his
                }

                onPress={
                    onShowLastLocation
                }

                activeOpacity={
                    0.8
                }
            >

                <Octicons
                    name="history"
                    size={24}
                    color="white"
                />

            </TouchableOpacity>

            {/* ==================================================
                SMS / LOCALIZAÇÃO
            ================================================== */}

            <TouchableOpacity

                style={
                    styles.sms
                }

                onPress={
                    onRequestSmsLocation
                }

                activeOpacity={
                    0.8
                }

                disabled={
                    smsLoading
                }
            >

                {smsLoading ? (

                    <ActivityIndicator
                        size="small"
                        color="#fff"
                    />

                ) : (

                    <FontAwesome
                        name="map-marker"
                        size={24}
                        color="white"
                    />

                )}

            </TouchableOpacity>

            {/* ==================================================
                MAPA EXTERNO
            ================================================== */}

            <TouchableOpacity

                style={
                    styles.fab
                }

                onPress={
                    onOpenExternalMap
                }

                activeOpacity={
                    0.8
                }
            >

                <Ionicons

                    name="paper-plane"

                    size={24}

                    color="white"

                    style={{
                        marginRight: 2,
                        marginTop: 3,
                    }}
                />

            </TouchableOpacity>

        </View>
    );
}