// src/components/layout/header.tsx
'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Menu, X, Heart, User, ChefHat } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { getUserInitials, getUserDisplayName } from '@/lib/image-utils';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrar plugins
gsap.registerPlugin(useGSAP, ScrollTrigger);

// Componente de enlace animado
const AnimatedNavLink = ({ href, children, isActive, onClick }) => {
  const linkRef = useRef(null);
  const underlineRef = useRef(null);
  
  useGSAP(() => {
    const link = linkRef.current;
    const underline = underlineRef.current;
    
    if (!link || !underline) return;
    
    // Configurar underline inicial
    gsap.set(underline, { 
      scaleX: isActive ? 1 : 0,
      transformOrigin: "left center"
    });
    
    const handleMouseEnter = () => {
      if (!isActive) {
        gsap.to(underline, {
          scaleX: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
      gsap.to(link, {
        y: -2,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };
    
    const handleMouseLeave = () => {
      if (!isActive) {
        gsap.to(underline, {
          scaleX: 0,
          duration: 0.3,
          ease: "power2.out"
        });
      }
      gsap.to(link, {
        y: 0,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };
    
    link.addEventListener('mouseenter', handleMouseEnter);
    link.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      if (link) {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, { scope: linkRef, dependencies: [isActive] });
  
  return (
    <Link 
      ref={linkRef}
      href={href} 
      className={`relative text-sm font-medium transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
      }`}
      onClick={onClick}
    >
      {children}
      <div 
        ref={underlineRef}
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
      />
    </Link>
  );
};

// Componente de botón animado
const AnimatedButton = ({ children, variant = "default", className = "", onClick, ...props }) => {
  const buttonRef = useRef(null);
  
  useGSAP(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    const handleMouseEnter = () => {
      gsap.to(button, {
        scale: 1.05,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(button, {
        scale: 1,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    };
    
    const handleClick = () => {
      gsap.to(button, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    };
    
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    button.addEventListener('click', handleClick);
    
    return () => {
      if (button) {
        button.removeEventListener('mouseenter', handleMouseEnter);
        button.removeEventListener('mouseleave', handleMouseLeave);
        button.removeEventListener('click', handleClick);
      }
    };
  }, { scope: buttonRef });
  
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2",
    ghost: "hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
  };
  
  return (
    <button 
      ref={buttonRef}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const headerRef = useRef(null);
  const logoRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const userActionsRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileButtonRef = useRef(null);

  // Detectar scroll para cambiar el estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 2000);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useGSAP(() => {
    // Verificar que los elementos existen antes de usarlos
    if (!headerRef.current) return;
    
    // Animación inicial del header
    const tl = gsap.timeline();
    
    tl.from(headerRef.current, {
      y: -100,
      opacity: 0,
      duration: 0.8,
      ease: "back.out(1.7)"
    });
    
    // Solo animar elementos que existen
    if (logoRef.current) {
      tl.from(logoRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)"
      }, "-=0.4");
    }
    
    if (navRef.current?.children?.length > 0) {
      tl.from(navRef.current.children, {
        y: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.3");
    }
    
    if (searchRef.current) {
      tl.from(searchRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)"
      }, "-=0.2");
    }
    
    if (userActionsRef.current?.children?.length > 0) {
      tl.from(userActionsRef.current.children, {
        x: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }, "-=0.2");
    }

    // Animación del logo con rotación continua del icono
    const logoIcon = logoRef.current?.querySelector('.logo-icon');
    if (logoIcon) {
      gsap.to(logoIcon, {
        rotation: 360,
        duration: 10,
        repeat: -1,
        ease: "none"
      });
    }

    // Efecto de cambio de estilo en scroll
    gsap.to(headerRef.current, {
      backgroundColor: isScrolled ? "rgba(var(--background), 0.95)" : "rgba(var(--background), 0.8)",
      backdropFilter: isScrolled ? "blur(12px)" : "blur(8px)",
      borderColor: isScrolled ? "rgba(var(--border), 0.8)" : "rgba(var(--border), 0.3)",
      duration: 0.3,
      ease: "power2.out"
    });

  }, { scope: headerRef, dependencies: [isScrolled] });

  // Animación del menú móvil
  useGSAP(() => {
    if (!mobileMenuRef.current) return;
    
    if (mobileMenuOpen) {
      gsap.fromTo(mobileMenuRef.current,
        {
          height: 0,
          opacity: 0
        },
        {
          height: "auto",
          opacity: 1,
          duration: 0.4,
          ease: "power2.out"
        }
      );
      
      const menuChildren = mobileMenuRef.current?.children;
      if (menuChildren && menuChildren.length > 0) {
        gsap.from(menuChildren, {
          y: 20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "back.out(1.7)",
          delay: 0.1
        });
      }
    }
  }, { scope: mobileMenuRef, dependencies: [mobileMenuOpen] });

  // Animación del botón del menú móvil
  useGSAP(() => {
    const button = mobileButtonRef.current;
    if (!button) return;
    
    const menuIcon = button.querySelector('.menu-icon');
    if (menuIcon) {
      gsap.to(menuIcon, {
        rotation: mobileMenuOpen ? 180 : 0,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  }, { scope: mobileButtonRef, dependencies: [mobileMenuOpen] });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/recipes?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      setShowLogoutDialog(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <header 
        ref={headerRef}
        className={`sticky top-0 z-40 w-full border-b transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-md shadow-sm' 
            : 'bg-background/80 backdrop-blur-sm'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo Animado */}
          <Link ref={logoRef} href="/" className="flex items-center space-x-2 group">
            <div className="logo-icon relative">
              <ChefHat className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold text-primary group-hover:text-primary/80 transition-colors">
              CacheOfRecipes
            </span>
          </Link>

          {/* Navegación Desktop */}
          <nav ref={navRef} className="hidden md:flex items-center space-x-8">
            <AnimatedNavLink href="/" isActive={isActive('/')}>
              Inicio
            </AnimatedNavLink>
            <AnimatedNavLink href="/recipes" isActive={isActive('/recipes')}>
              Recetas
            </AnimatedNavLink>
            <AnimatedNavLink href="/debug" isActive={isActive('/debug')}>
              DebugKeys
            </AnimatedNavLink>
            {user && (
              <AnimatedNavLink href="/favorites" isActive={isActive('/favorites')}>
                Favoritos
              </AnimatedNavLink>
            )}
          </nav>

          {/* Búsqueda y Acciones de Usuario Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <form ref={searchRef} onSubmit={handleSearch} className="relative group">
              <Input
                type="search"
                placeholder="Buscar recetas..."
                className="w-[200px] lg:w-[300px] pl-10 transition-all duration-300 group-hover:shadow-md focus:shadow-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
            </form>

            <SimpleThemeToggle />

            <div ref={userActionsRef} className="flex items-center space-x-2">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <AnimatedButton variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user.photoURL || ''} 
                          alt={getUserDisplayName(user)}
                          referrerPolicy="no-referrer"
                        />
                        <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                      </Avatar>
                    </AnimatedButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Mi Perfil</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/favorites" className="flex items-center">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favoritos</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600 focus:text-red-600">
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <AnimatedButton variant="ghost">
                    <Link href="/login">Iniciar Sesión</Link>
                  </AnimatedButton>
                  <AnimatedButton>
                    <Link href="/register">Registrarse</Link>
                  </AnimatedButton>
                </>
              )}
            </div>
          </div>

          {/* Botón Menú Móvil */}
          <div className="md:hidden flex items-center space-x-2">
            <SimpleThemeToggle />
            <AnimatedButton
              ref={mobileButtonRef}
              variant="ghost"
              className="p-2"
              onClick={toggleMobileMenu}
            >
              <div className="menu-icon">
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </div>
            </AnimatedButton>
          </div>
        </div>

        {/* Menú Móvil */}
        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="md:hidden border-t overflow-hidden">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Buscar recetas..."
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </form>

              <nav className="flex flex-col space-y-2">
                <AnimatedNavLink
                  href="/"
                  isActive={isActive('/')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="px-3 py-2 rounded-md w-full text-left">Inicio</div>
                </AnimatedNavLink>
                <AnimatedNavLink
                  href="/recipes"
                  isActive={isActive('/recipes')}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="px-3 py-2 rounded-md w-full text-left">Recetas</div>
                </AnimatedNavLink>
                
                {user && (
                  <>
                    <AnimatedNavLink
                      href="/favorites"
                      isActive={isActive('/favorites')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="px-3 py-2 rounded-md w-full text-left">Favoritos</div>
                    </AnimatedNavLink>
                    <AnimatedNavLink
                      href="/profile"
                      isActive={isActive('/profile')}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="px-3 py-2 rounded-md w-full text-left">Mi Perfil</div>
                    </AnimatedNavLink>
                  </>
                )}
              </nav>

              {!user ? (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <AnimatedButton variant="outline">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar Sesión
                    </Link>
                  </AnimatedButton>
                  <AnimatedButton>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      Registrarse
                    </Link>
                  </AnimatedButton>
                </div>
              ) : (
                <AnimatedButton 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogoutClick();
                  }}
                >
                  Cerrar Sesión
                </AnimatedButton>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Diálogo de Confirmación de Logout */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿De verdad quieres cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Sí, cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}