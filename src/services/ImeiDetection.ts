import { TrackerService } from './Trackerservice';

/**
 * Tenta detectar o IMEI de um rastreador enviando PARAM# via SMS, com timeout
 * de 1 minuto para o cadastro. Se conseguir, chama onDetected(imei). Se não,
 * resolve null para que a tela possa exibir o aviso de falha.
 */
export function detectImeiInBackground(
    service: TrackerService,
    onDetected: (imei: string) => void,
    timeoutMs = 60000
): Promise<string | null> {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log('⏰ Timeout de 1 minuto aguardando IMEI do rastreador.');
            resolve(null);
        }, timeoutMs);

        service.getParams()
            .then((reply) => {
                if (reply.imei) {
                    console.log('🔗 IMEI detectado automaticamente:', reply.imei);
                    onDetected(reply.imei);
                    resolve(reply.imei);
                    return;
                }

                resolve(null);
            })
            .catch((error) => {
                console.log('⚠️ Não foi possível detectar o IMEI automaticamente:', error.message);
                resolve(null);
            })
            .finally(() => {
                clearTimeout(timeout);
            });
    });
}