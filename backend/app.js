try {
    const Servidor = require('./Servidor');
    console.log('Servidor importado com sucesso.');
    const servidor = new Servidor();
    console.log('Servidor inicializado com sucesso.');
    servidor.iniciar();
} catch (err) {
    console.error('Erro ao iniciar o aplicativo:', err.message);
    console.error(err.stack);
}