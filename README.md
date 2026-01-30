# Dragon Chess

Aplicacion web de ajedrez tematica de Dragon Ball desarrollada con Laravel y React.

## Tecnologias

- Laravel 11
- React 18 con Inertia.js
- Tailwind CSS
- Vite

## Requisitos

- PHP 8.2 o superior
- Composer
- Node.js 18 o superior
- MySQL/PostgreSQL

## Instalacion

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/dragon_chess.git
cd dragon_chess
```

2. Instalar dependencias de PHP:
```bash
composer install
```

3. Instalar dependencias de Node:
```bash
npm install
```

4. Copiar el archivo de configuracion:
```bash
cp .env.example .env
```

5. Generar la clave de la aplicacion:
```bash
php artisan key:generate
```

6. Configurar la base de datos en el archivo `.env`

7. Ejecutar las migraciones:
```bash
php artisan migrate
```

## Desarrollo

### Con Laravel Herd

1. Iniciar Vite:
```bash
npm run dev
```

2. Acceder a: `http://dragon-chess.test`

### Sin Herd

1. Iniciar el servidor de Laravel:
```bash
php artisan serve
```

2. En otra terminal, iniciar Vite:
```bash
npm run dev
```

3. Acceder a: `http://127.0.0.1:8000`

## Estructura

- `/resources/js/Pages/Inicio.jsx` - Pantalla principal (lobby)
- `/resources/js/Pages/SelectorBando.jsx` - Seleccion de faccion
- `/resources/js/Pages/Batalla.jsx` - Arena de juego

## Produccion

Compilar assets para produccion:
```bash
npm run build
```

Optimizar Laravel:
```bash
php artisan optimize
```
