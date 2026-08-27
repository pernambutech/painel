// Página raiz do painel - redireciona para dashboard

import { redirect } from 'next/navigation';

export default function PainelRootPage() {
  redirect('/dashboard');
}
