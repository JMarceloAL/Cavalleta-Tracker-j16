// Importa o AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';

/*
    Chave utilizada para armazenar
    a sessão do usuário.
*/
const SESSION_KEY = '@cavalleta:session';
const CREDENTIALS_KEY = '@cavalleta:credentials';

export type StoredCredentials = {
    username: string;
    password: string;
};

/*
    Salva a sessão do usuário.

    Será chamado após um login válido.
*/
export async function saveSession(): Promise<void> {
    await AsyncStorage.setItem(SESSION_KEY, 'true');
}

/*
    Verifica se existe uma sessão salva.

    Retorna:

    true  -> usuário logado.

    false -> usuário não logado.
*/
export async function getSession(): Promise<boolean> {
    const session = await AsyncStorage.getItem(SESSION_KEY);
    return session === 'true';
}

export async function saveCredentials(username: string, password: string): Promise<void> {
    const payload: StoredCredentials = {
        username: username.trim(),
        password: password.trim(),
    };

    await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(payload));
}

export async function getCredentials(): Promise<StoredCredentials> {
    const raw = await AsyncStorage.getItem(CREDENTIALS_KEY);

    if (!raw) {
        return { username: 'root', password: 'root' };
    }

    try {
        const parsed = JSON.parse(raw) as Partial<StoredCredentials>;

        return {
            username: parsed.username?.trim() || 'root',
            password: parsed.password?.trim() || 'root',
        };
    } catch (error) {
        console.warn('Erro ao ler credenciais salvas:', error);
        return { username: 'root', password: 'root' };
    }
}

/*
    Remove a sessão do usuário.

    Será chamado quando o usuário
    realizar o logout.
*/
export async function logout(): Promise<void> {
    await AsyncStorage.removeItem(SESSION_KEY);
}