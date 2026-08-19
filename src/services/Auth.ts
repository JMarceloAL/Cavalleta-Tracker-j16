// Serviço responsável pela autenticação.

import { getCredentials, saveSession } from './storage/authStorage';

/*
    Realiza a autenticação do usuário.

    Retorna:

    true  -> Login válido.

    false -> Login inválido.
*/
export async function login(
    username: string,
    password: string
): Promise<boolean> {
    const cleanedUsername = username.trim();
    const cleanedPassword = password.trim();

    const stored = await getCredentials();
    const expectedUsername = stored.username || 'root';
    const expectedPassword = stored.password || 'root';

    if (
        cleanedUsername === expectedUsername &&
        cleanedPassword === expectedPassword
    ) {
        await saveSession();
        return true;
    }

    return false;
}