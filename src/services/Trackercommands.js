/**
 * Lista de comandos SMS suportados pelo rastreador J16 (baseado no manual do dispositivo).
 * Cada função monta a string exata que deve ser enviada por SMS ao número do chip
 * instalado no rastreador.
 */

export const TrackerCommands = {
    format: () => 'FORMAT',

    // APN
    getApn: () => 'APN#',
    setApn: (apn, user = '', pass = '') => `APN,${apn},${user},${pass}#`,

    // Servidor da plataforma
    getServer: () => 'SERVER#',
    setServerDomain: (domain, port) => `SERVER,1,${domain},${port},0#`,
    setServerIp: (ip, port) => `SERVER,0,${ip},${port},0#`,

    // Localização / status
    getLocationUrl: () => 'URL#',
    getStatus: () => 'STATUS#',
    getParams: () => 'PARAM#',
    restart: () => 'RESET#',

    // Bloqueio de óleo/energia
    getRelayStatus: () => 'RELAY#',
    cutRelay: () => 'RELAY,1#',      // desconecta óleo/energia
    restoreRelay: () => 'RELAY,0#',  // liga óleo/energia

    // Números de central (até 3)
    addCenterNumber: (slot, number) => (slot === 1 ? `CENTER,A,${number}#` : `CENTER,A${slot},${number}#`),
    deleteCenterNumber: (slot) => (slot === 1 ? 'CENTER,D#' : `CENTER,D${slot}#`),
    getCenterNumbers: () => 'CENTER#',

    // Números de SOS (até 3)
    addSosNumbers: (...numbers) => `SOS,A,${numbers.join(',')}#`,
    deleteSosNumbers: (...slots) => `SOS,D,${slots.join(',')}#`,
    getSosNumbers: () => 'SOS#',

    // Atendimento automático de chamada
    enableAutoAnswer: () => '777#',
    disableAutoAnswer: () => '888#',

    // Função da chamada recebida (monitoramento de voz vs link do Google)
    setCallFunction: (mode) => `SZCS#CALL_FUN=${mode}#`, // 0 = voz, 1 = link Google
    getCallFunction: () => 'CXCS#CALL_FUN',

    // Heartbeat — 2 parâmetros: seg. com ACC ON, min. com ACC OFF
    setHeartbeat: (accOnSec, accOffMin) => `HBT,${accOnSec},${accOffMin}#`,
    getHeartbeat: () => 'HBT#',

    // Intervalo de envio de posição
    setReportInterval: (accOnSec, accOffSec) => `TIMER,${accOnSec},${accOffSec}#`,
    getReportInterval: () => 'TIMER#',

    // Alarme de vibração — valores padrão como string, evita inferência "number" do TS
    enableVibrationAlarm: (mode = '0') => `SENALM,ON,${mode}#`,
    disableVibrationAlarm: () => 'SENALM,OFF#',
    getVibrationAlarm: () => 'SENALM#',

    // Alarme de queda de energia
    enablePowerAlarm: (mode, t1, t2) => `POWERALM,ON,${mode},${t1},${t2}#`,
    disablePowerAlarm: () => 'POWERALM,OFF#',
    getPowerAlarm: () => 'POWERALM#',

    // Bateria fraca
    enableBatteryAlarm: (mode = '0') => `BATALM,ON,${mode}#`,
    disableBatteryAlarm: () => 'BATALM,OFF#',
    getBatteryAlarm: () => 'BATALM#',

    // Alarme de movimento
    enableMovingAlarm: (radius, mode = '0') => `MOVING,ON,${radius},${mode}#`,
    disableMovingAlarm: () => 'MOVING,OFF#',
    getMovingAlarm: () => 'MOVING#',

    // Alarme de excesso de velocidade
    enableSpeedAlarm: (durationSec, speedKmh, mode = '1') => `SPEED,ON,${durationSec},${speedKmh},${mode}#`,
    disableSpeedAlarm: () => 'SPEED,OFF#',
    getSpeedAlarm: () => 'SPEED#',

    // Alarme de ignição ligada (ACC ON)
    enableAccOnAlarm: (mode = '3') => `ACCALM,ON,${mode}#`,
    disableAccOnAlarm: () => 'ACCALM,OFF#',
    getAccOnAlarm: () => 'ACCALM#',

    // Alarme de ignição desligada (ACC OFF)
    enableAccOffAlarm: (mode = '3') => `ACCOFFALM,ON,${mode}#`,
    disableAccOffAlarm: () => 'ACCOFFALM,OFF#',
    getAccOffAlarm: () => 'ACCOFFALM#',

    // Modo sleep
    getSleepMode: () => 'CXCS#SLPDISCONNECT',

    // Fuso horário — 3 parâmetros: direção, horas, meio-fuso (0/15/30/45)
    setTimezone: (direction, hours, halfZoneMinutes = '0') => `GMT,${direction},${hours},${halfZoneMinutes}#`,
    getTimezone: () => 'GMT#',
};