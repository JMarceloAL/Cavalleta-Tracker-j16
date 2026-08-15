import { sendSmsToTracker, listenForIncomingSms } from './Smsgateway';
import { TrackerCommands } from './Trackercommands';
import { parseTrackerReply } from './Trackerparse';

/**
 * Orquestra o ciclo "enviar comando -> aguardar resposta do rastreador".
 * Como SMS não tem correlação nativa de request/response, casamos a resposta
 * pelo número de origem (deve ser o número do rastreador) dentro de uma
 * janela de tempo.
 */
export class TrackerService {
    constructor(trackerPhoneNumber, { timeoutMs = 20000 } = {}) {
        this.trackerPhoneNumber = trackerPhoneNumber;
        this.timeoutMs = timeoutMs;
        this.pendingResolvers = [];
        this.unsubscribe = listenForIncomingSms(this._handleIncoming.bind(this));
    }

    _handleIncoming({ originatingAddress, body }) {




        const from = originatingAddress?.replace(/\D/g, '').slice(-9);
        const expected = this.trackerPhoneNumber.replace(/\D/g, '').slice(-9);

        console.log('📩 SMS recebido — de:', originatingAddress, '| esperado:', this.trackerPhoneNumber);
        console.log('📩 Corpo bruto:', JSON.stringify(body));

        if (from !== expected) {
            console.log('⏭️ Ignorado — número não confere');
            return;
        }

        const parsed = parseTrackerReply(body);
        console.log('🔍 Classificado como:', parsed.type, parsed);

        if (parsed.type === 'deliveryReport') {
            console.log('⏭️ Ignorado — é relatório de entrega');
            return;
        }

        const resolver = this.pendingResolvers.shift();
        if (resolver) resolver.resolve(parsed);
    }

    sendCommand(commandString) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                this.pendingResolvers = this.pendingResolvers.filter((r) => r.resolve !== resolve);
                reject(new Error(`Timeout aguardando resposta do rastreador para: ${commandString}`));
            }, this.timeoutMs);

            this.pendingResolvers.push({
                resolve: (parsed) => {
                    clearTimeout(timer);
                    resolve(parsed);
                },
            });

            sendSmsToTracker(this.trackerPhoneNumber, commandString).catch((err) => {
                clearTimeout(timer);
                reject(err);
            });
        });
    }
    /** Atalho para pedir os parâmetros (inclui IMEI) */
    async getParams() {
        const reply = await this.sendCommand(TrackerCommands.getParams());

        if (!reply.imei) {
            throw new Error(`Resposta não contém IMEI: ${JSON.stringify(reply)}`);
        }

        return reply;
    }

    /** Atalho para pedir a localização atual */
    async getLocation() {
        const reply = await this.sendCommand(TrackerCommands.getLocationUrl());

        if (reply.type === 'noSignal') {
            const error = new Error('Rastreador sem sinal de GPS. Verifique se o dispositivo está em local aberto.');
            error.code = 'NO_SIGNAL'; // <- marca o tipo do erro pra tratarmos na UI
            throw error;
        }

        if (reply.type !== 'location') {
            throw new Error(`Resposta inesperada ao pedir localização: ${JSON.stringify(reply)}`);
        }

        return reply;
    }

    /** Atalho para pedir o status atual do rastreador */
    async getStatus() {
        const reply = await this.sendCommand(TrackerCommands.getStatus());
        if (reply.type !== 'status') {
            throw new Error(`Resposta inesperada ao pedir status: ${JSON.stringify(reply)}`);
        }
        return reply;
    }

    destroy() {
        this.unsubscribe?.();
    }
}