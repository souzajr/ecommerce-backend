/* eslint-disable no-console */
import mongoose from 'mongoose';

class DbConfig {
  async openConn() {
    try {
      await mongoose.connect(process.env.DB_HOST!);

      console.log(
        '\x1b[41m\x1b[37m',
        'CONECTADO COM SUCESSO NO BANCO DE DADOS',
        '\x1b[0m'
      );
    } catch {
      console.log(
        '\x1b[41m\x1b[37m',
        'ERRO AO SE CONECTAR COM O BANCO DE DADOS',
        '\x1b[0m'
      );
    }
  }
}

export default new DbConfig();
