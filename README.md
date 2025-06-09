# 🍳 Cache of Recipes

**Cache of Recipes** es una aplicación web moderna construida con Next.js que permite a los usuarios descubrir, guardar y compartir recetas culinarias. La aplicación utiliza la API de Spoonacular para obtener una amplia variedad de recetas y ofrece funcionalidades avanzadas como autenticación, gestión de favoritos y calificaciones.

## ✨ Características Principales

- 🔍 **Búsqueda Avanzada**: Busca recetas por nombre, ingredientes, tipo de cocina, dietas especiales y más
- ❤️ **Sistema de Favoritos**: Guarda tus recetas preferidas para acceso rápido
- ⭐ **Calificaciones y Reseñas**: Comparte opiniones y califica recetas
- 👤 **Autenticación Completa**: Registro e inicio de sesión con email/contraseña o Google
- 📱 **Diseño Responsivo**: Interfaz optimizada para dispositivos móviles y escritorio
- 🎨 **Animaciones GSAP**: Experiencia de usuario fluida con animaciones modernas
- 🌙 **Modo Oscuro**: Soporte completo para tema claro y oscuro
- 🔄 **Gestión Inteligente de API**: Sistema robusto con múltiples claves API y manejo de errores

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.3.2** - Framework React con SSR/SSG
- **React 19** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Framework de estilos utility-first
- **GSAP** - Animaciones avanzadas y efectos visuales
- **Radix UI** - Componentes de interfaz accesibles
- **React Hook Form** - Gestión de formularios
- **React Query** - Gestión de estado del servidor
- **Zod** - Validación de esquemas
- **Lucide React** - Iconografía moderna

### Backend y Servicios
- **Firebase** - Autenticación y base de datos
  - Authentication (Email/Password y Google)
  - Firestore (base de datos NoSQL)
  - Storage (almacenamiento de archivos)
- **Spoonacular API** - Datos de recetas y nutrición
- **Axios** - Cliente HTTP para requests API

### Herramientas de Desarrollo
- **ESLint** - Linting de código
- **PostCSS** - Procesamiento de CSS
- **Next Themes** - Gestión de temas

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   │   ├── login/         # Página de inicio de sesión
│   │   └── register/      # Página de registro
│   ├── (main)/            # Rutas principales protegidas
│   │   ├── favorites/     # Gestión de recetas favoritas
│   │   ├── profile/       # Perfil de usuario
│   │   └── recipes/       # Búsqueda y detalles de recetas
│   └── api/               # API Routes
│       └── spoonacular/   # Proxy para API de Spoonacular
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── recipes/          # Componentes relacionados con recetas
│   ├── ui/               # Componentes UI base (shadcn/ui)
│   └── layout/           # Componentes de layout
├── context/              # Contextos de React
├── hooks/                # Hooks personalizados
├── lib/                  # Utilidades y configuraciones
│   └── server/           # Lógica del servidor
├── types/                # Definiciones de TypeScript
└── middleware.ts         # Middleware de Next.js
```

## 🚀 Instalación y Configuración

### Prerequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Firebase
- API Key de Spoonacular

### 1. Clona el repositorio
```bash
git clone https://github.com/tuusuario/cacheofrecipes.git
cd cacheofrecipes
```

### 2. Instala las dependencias
```bash
npm install
```

### 3. Configura las variables de entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Spoonacular API Keys (separadas por comas para balanceo de carga)
SPOONACULAR_API_KEYS=key1,key2,key3

# URL de la aplicación (para producción)
NEXT_PUBLIC_API_URL=https://tu-dominio.com
```

### 4. Configura Firebase
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password y Google)
3. Crea una base de datos Firestore
4. Configura las reglas de seguridad de Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para favoritos
    match /favorites/{document} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reglas para reseñas
    match /reviews/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 5. Obtén una API Key de Spoonacular
1. Registrate en [Spoonacular API](https://spoonacular.com/food-api)
2. Obtén tu API key desde el dashboard
3. Para mejor rendimiento, considera obtener múltiples keys

### 6. Ejecuta la aplicación
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Funcionalidades Detalladas

### Autenticación
- **Registro con email**: Validación completa de formularios
- **Inicio de sesión**: Persistencia de sesión
- **Google OAuth**: Integración nativa con Firebase Auth
- **Gestión de perfil**: Actualización de datos personales
- **Restablecimiento de contraseña**: Por email

### Búsqueda de Recetas
- **Filtros avanzados**: Por cocina, dieta, intolerancia, tiempo de preparación
- **Búsqueda por texto**: Título, ingredientes o descripción
- **Ordenamiento**: Por popularidad, tiempo, puntuación nutricional
- **Paginación**: Carga eficiente de resultados
- **Recetas similares**: Recomendaciones basadas en selección

### Gestión de Favoritos
- **Añadir/quitar favoritos**: Con feedback visual inmediato
- **Persistencia**: Sincronización con Firebase Firestore
- **Carga optimizada**: Lazy loading de detalles de recetas
- **Vista dedicada**: Página especial para gestionar favoritos

### Sistema de Reseñas
- **Calificación por estrellas**: Sistema de 1 a 5 estrellas
- **Comentarios**: Texto libre para opiniones detalladas
- **Agregación**: Cálculo automático de puntuación promedio
- **Validación**: Solo usuarios autenticados pueden reseñar

### Gestión de API
- **Múltiples claves**: Balanceo automático de carga
- **Reintentos inteligentes**: Manejo robusto de errores
- **Límites de rate**: Respeto de las limitaciones de la API
- **Proxy interno**: Protección de claves API del frontend

## 🎨 Diseño y UX

### Animaciones GSAP
- **Elementos flotantes**: Decoraciones animadas en la página principal
- **Transiciones suaves**: Entre estados y páginas
- **Efectos de hover**: Interacciones responsivas
- **Loading states**: Feedback visual durante cargas

### Componentes UI
- **Diseño consistente**: Basado en shadcn/ui y Radix
- **Accesibilidad**: Soporte completo para lectores de pantalla
- **Responsive**: Adaptación automática a diferentes tamaños de pantalla
- **Temas**: Modo claro y oscuro con transiciones suaves

## 📊 Estructura de Datos

### Firestore Collections

#### Users
```typescript
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  photoURL: string | null;
  bio: string | null;
  createdAt: Timestamp;
}
```

#### Favorites
```typescript
{
  userId: string;
  recipeId: number;
  createdAt: Timestamp;
}
```

#### Reviews
```typescript
{
  userId: string;
  recipeId: number;
  rating: number;
  comment: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔒 Seguridad

- **Autenticación Firebase**: Gestión segura de sesiones
- **Reglas Firestore**: Control de acceso a datos
- **Validación de entrada**: Schemas Zod en formularios
- **Middleware de protección**: Rutas protegidas por autenticación
- **Sanitización**: Limpieza de datos de usuario
- **HTTPS obligatorio**: En producción

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Variables de entorno en producción
Asegúrate de configurar todas las variables de entorno en tu plataforma de deployment.

### Consideraciones de producción
- Configura un dominio personalizado
- Habilita analytics
- Configura alertas de monitoreo
- Optimiza las imágenes con next/image

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Linting
npm run lint
```

## 📈 Performance

- **Lazy loading**: Componentes y rutas cargadas bajo demanda
- **Optimización de imágenes**: Compresión automática con Next.js
- **Code splitting**: Bundles optimizados por ruta
- **Caching**: Estrategias de cache para API calls
- **Preloading**: Prefetch de rutas críticas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autor

**Tu Nombre** - [tu-email@example.com](mailto:tu-email@example.com)

## 🙏 Agradecimientos

- [Spoonacular API](https://spoonacular.com/food-api) por los datos de recetas
- [Firebase](https://firebase.google.com/) por la infraestructura backend
- [shadcn/ui](https://ui.shadcn.com/) por los componentes UI
- [GSAP](https://greensock.com/gsap/) por las animaciones
- La comunidad de Next.js por el excelente framework

---

⭐ Si este proyecto te ha sido útil, ¡considera darle una estrella en GitHub!