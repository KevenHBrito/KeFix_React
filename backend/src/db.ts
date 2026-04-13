import { PrismaClient } from "@prisma/client";

// Instancia unica do Prisma usada nas consultas ao banco.
export const prisma = new PrismaClient();

// Verifica rapidamente se a conexao com o banco esta ativa.
export async function checkDbConnection() {
	try {
		await prisma.$queryRaw`SELECT 1`;
		return true;
	} catch {
		return false;
	}
}

// Tenta conectar ao banco com retentativas para cenarios de inicializacao lenta (ex.: MySQL subindo).
export async function connectPrismaWithRetry(maxTentativas = 10, esperaMs = 3000) {
	for (let tentativa = 1; tentativa <= maxTentativas; tentativa++) {
		try {
			await prisma.$connect();
			return true;
		} catch (err) {
			const ultimo = tentativa === maxTentativas;
			console.error(`[db] Falha ao conectar (tentativa ${tentativa}/${maxTentativas}).`, err);
			if (ultimo) return false;
			await new Promise((resolve) => setTimeout(resolve, esperaMs));
		}
	}
	return false;
}
