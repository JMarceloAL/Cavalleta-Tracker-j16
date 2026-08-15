import { TrackerService } from './Trackerservice';

/**
 * Tenta detectar o IMEI de um rastreador enviando PARAM# via SMS,
 * de forma totalmente silenciosa (sem bloquear a UI, sem alertas).
 * Chama onDetected(imei) se conseguir; não faz nada em caso de erro/timeout.
 */
export function detectImeiInBackground(
    service: TrackerService,
    onDetected: (imei: string) => void
) {
    service.getParams()
        .then((reply) => {
            if (reply.imei) {
                console.log('🔗 IMEI detectado automaticamente:', reply.imei);
                onDetected(reply.imei);
            }
        })
        .catch((error) => {
            console.log('⚠️ Não foi possível detectar o IMEI automaticamente:', error.message);
        });
}