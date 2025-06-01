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
                <p className="text-sm mt-2">
                  Datos de recetas proporcionados por{' '}
                  <a 
                    href="https://spoonacular.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Spoonacular API
                  </a>
                </p>
          </div>
        </div>
      </div>
    </footer>
  );
}