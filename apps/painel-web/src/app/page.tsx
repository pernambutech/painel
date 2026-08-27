// Página inicial do painel web
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <main className={inter.className}>
      <h1>Painel de Gerenciamento</h1>
      <p>Plataforma de gerenciamento centralizado de projetos e serviços</p>
    </main>
  );
}
