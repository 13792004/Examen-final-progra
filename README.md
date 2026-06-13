# TareasApp

Aplicacion movil de gestion de tareas desarrollada con **React Native** y **Expo SDK 54**. Permite crear, editar, eliminar y marcar tareas como completadas, con persistencia local mediante SQLite y notificaciones push.

## Tecnologias utilizadas

- [Expo SDK 54](https://docs.expo.dev/versions/v54.0.0/) — plataforma de desarrollo movil
- [Expo Router](https://docs.expo.dev/router/introduction/) — navegacion basada en archivos
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — base de datos local
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) — notificaciones push
- [TypeScript](https://www.typescriptlang.org/) — tipado estatico
- [React Native](https://reactnative.dev/) — framework de UI movil

## Funcionalidades

- Crear tareas con titulo y descripcion
- Editar tareas existentes
- Eliminar tareas con confirmacion
- Marcar tareas como completadas (tachado visual)
- Notificaciones instantaneas al crear o actualizar una tarea
- Persistencia de datos con SQLite (los datos se conservan al cerrar la app)

## Estructura del proyecto

```
TareasApp/
├── app.json                        # Configuracion de la app Expo
├── package.json                    # Dependencias del proyecto
├── tsconfig.json                   # Configuracion de TypeScript
├── assets/
│   └── images/                     # Iconos y splash screen
├── src/
│   ├── app/
│   │   ├── _layout.tsx             # Layout raiz con SQLiteProvider
│   │   └── index.tsx               # Pantalla principal (CRUD de tareas)
│   ├── components/                 # Componentes reutilizables de UI
│   ├── constants/
│   │   └── theme.ts                # Colores y estilos globales
│   └── hooks/                      # Hooks personalizados
└── scripts/
    └── reset-project.js            # Script para reiniciar el proyecto
```

## Arquitectura

La app sigue una arquitectura simple de una sola pantalla:

- `_layout.tsx` inicializa el proveedor de SQLite y envuelve la navegacion.
- `index.tsx` contiene toda la logica de negocio: creacion de la tabla, operaciones CRUD, notificaciones y renderizado de la lista.

La base de datos SQLite se crea automaticamente en el primer inicio con la siguiente tabla:

```sql
CREATE TABLE IF NOT EXISTS tareas (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo      TEXT    NOT NULL,
  descripcion TEXT,
  completada  INTEGER DEFAULT 0
);
```

## Instalacion y ejecucion

### Requisitos

- Node.js 18+
- Expo Go 54.x instalado en el celular

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/13792004/Examen-final-progra.git
cd Examen-final-progra

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npx expo start

# 4. Escanear el codigo QR con Expo Go
```

Para ejecutar con tunnel (funciona desde cualquier red):

```bash
npx expo start --tunnel
```

## Autor

Pablo Mateo
