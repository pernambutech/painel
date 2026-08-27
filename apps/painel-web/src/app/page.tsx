// Página inicial - redireciona para o painel

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/ambientes');
}
