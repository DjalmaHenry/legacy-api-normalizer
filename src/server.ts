import dotenv from 'dotenv';
import { buildApp } from './app';

dotenv.config();

const start = async () => {
  try {
    const app = await buildApp();

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || 'localhost';
    const hostUrl = process.env.HOST_URL || `http://${host}:${port}`;

    await app.listen({ port, host });

    console.log(`Servidor rodando em ${hostUrl}`);
    console.log(`Documentação disponível em ${hostUrl}/docs`);
  } catch (err) {
    console.error('Erro ao iniciar servidor:', err);
    process.exit(1);
  }
};

start();
