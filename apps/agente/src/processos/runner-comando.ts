/**
 * Runner de comando usado pelo AdaptadorPm2 no Windows.
 *
 * O PM2 inicia este script Node (processo "node" direto — cuja saída o PM2
 * captura normalmente, ao contrário de processos iniciados via cmd.exe) e ele
 * executa o comando do serviço com o stdout/stderr apontando para os arquivos
 * de log da pasta do painel (~/.painel/logs).
 *
 * Uso: node runner-comando.js <caminhoOut> <caminhoErro> <comando...>
 */
import { spawn } from 'child_process';
import * as fs from 'fs';

function principal(): void {
  const caminhoOut = process.argv[2];
  const caminhoErro = process.argv[3];
  const comando = process.argv.slice(4).join(' ');

  if (!caminhoOut || !caminhoErro || !comando) {
    console.error('Uso: node runner-comando.js <out> <err> <comando>');
    process.exit(1);
  }

  // Abre os arquivos em modo append (o PM2 também mantém os dele, vazios).
  const fdOut = fs.openSync(caminhoOut, 'a');
  const fdErr = fs.openSync(caminhoErro, 'a');

  const filho = spawn(comando, { shell: true, stdio: ['ignore', fdOut, fdErr] });

  filho.on('error', (erro) => {
    try {
      fs.writeSync(fdErr, `runner: ${erro.message}\n`);
    } catch {
      // Arquivo fechado — nada a fazer.
    }
    try {
      fs.closeSync(fdOut);
      fs.closeSync(fdErr);
    } catch {
      // Ignora erro ao fechar.
    }
    process.exit(1);
  });

  filho.on('exit', (code, sinal) => {
    try {
      fs.closeSync(fdOut);
      fs.closeSync(fdErr);
    } catch {
      // Ignora erro ao fechar.
    }
    process.exitCode = code ?? (sinal ? 1 : 0);
  });
}

// Executa somente quando chamado diretamente (node runner-comando.js ...).
// O AdaptadorPm2 não importa este módulo — apenas referencia o caminho.
if (require.main === module) {
  principal();
}