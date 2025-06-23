import { buildApp } from './app';

const start = async () => {
  try {
    const app = await buildApp();
    const port = 3000;
    
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
    console.log(`📚 Docs em http://localhost:${port}/docs`);
  } catch (err) {
    console.error('Erro:', err);
    process.exit(1);
  }
};

start();
