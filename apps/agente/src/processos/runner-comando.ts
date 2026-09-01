/**
 * Runner de comando usado pelo AdaptadorPm2 no Windows.
 *
 * O PM2 inicia este script Node (processo "node" direto — cuja saída o PM2
 * captura normalmente, ao contrário de processos iniciados via cmd.exe) e ele
 * executa o comando do serviço, gravando logs com timestamp real em cada linha.
 *
 * Uso: node runner-comando.js <caminhoOut> <caminhoErro> <comando...>
 */
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as readline from 'readline';

/**
 * Formata Date para [YYYY-MM-DD HH:mm:ss] — timestamp real da linha.
 */
function formatarTimestamp(): string {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  const horas = String(agora.getHours()).padStart(2, '0');
  const minutos = String(agora.getMinutes()).padStart(2, '0');
  const segundos = String(agora.getSeconds()).padStart(2, '0');
  return `[${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}]`;
}

/**
 * Conecta um ReadableStream (stdout ou stderr) a um fd de arquivo,
 * gravando cada linha com timestamp real.
 */
function conectarStream(
  stream: NodeJS.ReadableStream | null,
  fd: number,
): void {
  if (!stream) return;

  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  rl.on('line', (linha: string) => {
    try {
      fs.writeSync(fd, `${formatarTimestamp()} ${linha}\n`);
    } catch {
      // Arquivo fechado — ignora.
    }
  });

  // readline fecha o input automaticamente no 'close' do stream.
}

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

  // Usa pipe para poder interceptar cada linha e adicionar timestamp
  const filho: ChildProcess = spawn(comando, {
    shell: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Conecta stdout e stderr ao arquivos com timestamp
  conectarStream(filho.stdout, fdOut);
  conectarStream(filho.stderr, fdErr);

  filho.on('error', (erro) => {
    try {
      fs.writeSync(fdErr, `${formatarTimestamp()} runner: ERRO - ${erro.message}\n`);
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
      fs.writeSync(fdOut, `${formatarTimestamp()} [processo encerrado com código ${code}${sinal ? ` sinal ${sinal}` : ''}]\n`);
    } catch {
      // Ignora.
    }
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
