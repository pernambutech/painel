import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { obterComandoStartup } from './adaptador-pm2';

describe('persistência PM2', () => {
  it('deve gerar o comando de startup para linux e windows sem depender do SO', () => {
    assert.equal(obterComandoStartup('linux'), 'pm2 startup');
    assert.equal(obterComandoStartup('win32'), 'pm2 startup');
  });
});
