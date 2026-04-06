import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Atualizar a sessão (necessário para refresh tokens)
  let response = await updateSession(request);

  // 2. Criar cliente Supabase para verificar estado atual
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // Listas de rotas
  const publicRoutes = ['/login', '/cadastro', '/recuperar-senha'];
  const protectedRoutes = [
    '/',
    '/grupos',
    '/marketplaces',
    '/listas-destino',
    '/canais',
    '/radar-ofertas',
    '/carrinho-ofertas',
    '/envio-rapido',
    '/monitoramento',
    '/campanhas',
    '/automacoes',
    '/relatorios',
    '/ganhos',
    '/configuracoes',
    '/assistente-ia',
  ];

  const isPublicRoute = publicRoutes.includes(pathname);
  const isProtectedRoute = protectedRoutes.includes(pathname) || protectedRoutes.some(route => route !== '/' && pathname.startsWith(route));

  // Redirecionamento 1: Se não estiver logado e tentar acessar rota protegida
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirecionamento 2: Se estiver logado e tentar acessar rota pública (login/cadastro)
  if (user && isPublicRoute) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
