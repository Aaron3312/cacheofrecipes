// src/components/layout/footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} CacheOfRecipes. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4">
            <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
              Acerca de
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Términos
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Privacidad
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}