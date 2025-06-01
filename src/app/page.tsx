'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';
import { ChevronRight, Utensils, Heart, Search, Users, Sparkles } from 'lucide-react';

// Registrar plugins de GSAP
gsap.registerPlugin(useGSAP, ScrollTrigger, TextPlugin);

// Componente de botón animado
const AnimatedButton = ({ children, href, variant = "default", size = "lg", ...props }) => {
  const buttonRef = useRef(null);
  
  useGSAP(() => {
    const button = buttonRef.current;
    
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
    
    button.addEventListener('mouseenter', handleMouseEnter);
    button.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      button.removeEventListener('mouseenter', handleMouseEnter);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: buttonRef });
  
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground"
  };
  const sizeClasses = {
    lg: "h-11 px-8 rounded-md text-lg"
  };
  
  return (
    <Link href={href} passHref>
      <button 
        ref={buttonRef}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
        {...props}
      >
        {children}
      </button>
    </Link>
  );
};

// Componente de tarjeta de característica animada
const FeatureCard = ({ icon: Icon, title, description, index }) => {
  const cardRef = useRef(null);
  
  useGSAP(() => {
    const card = cardRef.current;
    
    // Animación de entrada con ScrollTrigger
    gsap.fromTo(card, 
      {
        opacity: 0,
        y: 50,
        rotateY: -15,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.8,
        delay: index * 0.1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    // Animación de hover
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(card.querySelector('.icon-container'), {
        rotation: 360,
        scale: 1.1,
        duration: 0.6,
        ease: "back.out(1.7)"
      });
    };
    
    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(card.querySelector('.icon-container'), {
        rotation: 0,
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    };
    
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, { scope: cardRef });
  
  return (
    <div 
      ref={cardRef}
      className="flex flex-col items-center text-center p-6 bg-card rounded-lg border shadow-sm cursor-pointer transform-gpu"
    >
      <div className="icon-container h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default function HomePage() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);
  const floatingElementsRef = useRef(null);
  
  useGSAP(() => {
    // Crear elementos flotantes decorativos
    const createFloatingElements = () => {
      const container = floatingElementsRef.current;
      const elements = [];
      
      for (let i = 0; i < 20; i++) {
        const element = document.createElement('div');
        element.className = 'floating-element absolute rounded-full opacity-20';
        element.style.background = `linear-gradient(45deg, hsl(var(--primary)), hsl(var(--primary) / 0.8), hsl(var(--primary) / 0.6))`;
        
        const size = Math.random() * 20 + 5;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.left = `${Math.random() * 100}%`;
        element.style.top = `${Math.random() * 100}%`;
        
        container.appendChild(element);
        elements.push(element);
      }
      
      // Animar elementos flotantes
      elements.forEach((element, index) => {
        gsap.to(element, {
          y: `random(-100, 100)`,
          x: `random(-50, 50)`,
          rotation: `random(-180, 180)`,
          scale: `random(0.5, 1.5)`,
          duration: `random(15, 25)`,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.5
        });
      });
    };
    
    createFloatingElements();
    
    // Timeline principal para la sección hero
    const heroTl = gsap.timeline();
    
    // Animación inicial del título con efecto de escritura
    const titleText = "Descubre, Guarda y Comparte\nRecetas Deliciosas";
    gsap.set(titleRef.current, { text: "" });
    
    heroTl
      .from(heroRef.current, {
        opacity: 0,
        duration: 0.5
      })
      .to(titleRef.current, {
        text: titleText,
        duration: 2,
        ease: "none",
        delay: 0.5
      })
      .from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "back.out(1.7)"
      }, "-=0.5")
      .from(buttonsRef.current.children, {
        opacity: 0,
        y: 20,
        scale: 0.8,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.7)"
      }, "-=0.3");
    
    // Animación de parallax para el fondo del hero
    gsap.to(heroRef.current, {
      yPercent: -50,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
    
    // Animación del título de características
    gsap.fromTo(featuresRef.current.querySelector('h2'),
      {
        opacity: 0,
        y: 50,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: featuresRef.current.querySelector('h2'),
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    // Animación de la sección CTA
    gsap.fromTo(ctaRef.current,
      {
        opacity: 0,
        y: 100,
        scale: 0.95,
        rotateX: -10
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 1.2,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: ctaRef.current,
          start: "top 85%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
    
    // Animación continua de brillo para elementos destacados
    const sparkleElements = containerRef.current.querySelectorAll("[data-sparkle]");
    if (sparkleElements.length > 0) {
      gsap.to(sparkleElements, {
        backgroundPosition: "200% center",
        duration: 3,
        repeat: -1,
        ease: "power2.inOut"
      });
    }
    
  }, { scope: containerRef });
  
  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden bg-background">
      {/* Elementos flotantes decorativos */}
      <div ref={floatingElementsRef} className="fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 space-y-16 py-8">
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
          <div className="container mx-auto px-4 flex flex-col items-center text-center relative z-10">
            <h1 
              ref={titleRef}
              className="mt-20 text-4xl md:text-5xl  lg:text-6xl font-bold tracking-tight mb-6 text-primary relative z-10"
            >
              {/* El texto se llenará con GSAP */}
            </h1>
            <p 
              ref={subtitleRef}
              className="text-xl text-muted-foreground mb-8 max-w-2xl relative z-10"
            >
              CacheOfRecipes te ayuda a encontrar inspiración culinaria, guardar tus recetas favoritas y compartir tus opiniones con la comunidad.
            </p>
            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 relative z-10">
              <AnimatedButton href="/recipes">
                Explorar Recetas
                <ChevronRight className="ml-2 h-4 w-4" />
              </AnimatedButton>
              <AnimatedButton href="/register" variant="outline">
                Crear Cuenta
              </AnimatedButton>
            </div>
          </div>
          
          {/* Elementos decorativos del hero */}

            <div className="hidden sm:block absolute bottom-20 right-10  text-primary/40 animate-bounce z-0">
            <Utensils className="h-12 w-12" />
            </div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="container mx-auto px-4 ">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Características Principales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={Search}
              title="Busca Recetas"
              description="Encuentra miles de recetas para cualquier ocasión, dieta o preferencia."
              index={0}
            />
            <FeatureCard
              icon={Heart}
              title="Guarda Favoritos"
              description="Guarda tus recetas favoritas para acceder a ellas fácilmente después."
              index={1}
            />
            <FeatureCard
              icon={Users}
              title="Califica y Comenta"
              description="Comparte tus experiencias y opiniones sobre las recetas con la comunidad."
              index={2}
            />
            <FeatureCard
              icon={Utensils}
              title="Recetas Detalladas"
              description="Accede a instrucciones paso a paso, información nutricional e ingredientes."
              index={3}
            />
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4">
          <div 
            ref={ctaRef}
            className="max-w-3xl mx-auto text-center py-16 px-8 bg-primary/5 rounded-2xl border relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Únete a nuestra comunidad y comienza a descubrir nuevas delicias culinarias hoy mismo.
            </p>
            <AnimatedButton href="/recipes">
              Explorar Recetas
              <ChevronRight className="ml-2 h-4 w-4" />
            </AnimatedButton>
          </div>
        </section>
      </div>
    </div>
  );
}