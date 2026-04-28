# Documentación del Proyecto: Sistema Web para Control de Parqueadero
**SENA - NODO TIC | ADSO 17**

---

## 1. Introducción
El presente documento describe el desarrollo y funcionamiento del Sistema Web para el Control de Parqueadero, diseñado para gestionar eficientemente la entrada y salida de vehículos (sedán, camioneta y moto), automatizar el cálculo de cobros y mantener un control de cupos en tiempo real.

## 2. Objetivos de la Actividad
Desarrollar una aplicación web funcional y responsiva que permita:
- Gestionar el flujo de vehículos mediante registros de entrada y salida.
- Calcular automáticamente las tarifas basadas en el tiempo de permanencia.
- Controlar la disponibilidad de cupos (30 para autos, 15 para motos).
- Administrar usuarios, roles (Admin/Operario) y configurar tarifas dinámicas.

## 3. Tecnologías Utilizadas
Siguiendo los requisitos mínimos solicitados:

### Backend
- **Node.js**: Entorno de ejecución para JavaScript.
- **Express**: Framework para la creación de la API REST.
- **Sequelize**: ORM para la gestión de la base de datos MySQL.
- **Bcryptjs**: Encriptación de contraseñas de seguridad.

### Frontend
- **HTML5 & CSS3**: Estructura y diseño premium responsivo.
- **JavaScript (Vanilla)**: Lógica de interacción y consumo de API.
- **Google Fonts**: Tipografías modernas (Inter).

### Base de Datos & Despliegue
- **MySQL (Aiven Cloud)**: Motor de base de datos relacional alojado en la nube.
- **Vercel**: Hosting para la aplicación web (Frontend y Backend).

## 4. Requisitos Funcionales
El sistema cumple con el 100% de los requisitos definidos:

### 4.1 Gestión de Vehículos
- **Entrada**: Registro por placa, tipo de vehículo y asignación automática de espacio. Validación de cupos antes de permitir el ingreso.
- **Salida**: Cálculo automático del tiempo de permanencia y valor total a pagar. Liberación automática del espacio al finalizar.
- **Control de Cupos**: Visualización en tiempo real de espacios disponibles y ocupados por categoría.

### 4.2 Tarifas y Cobros
- **Módulo de Tarifas**: Panel para que el Administrador configure el valor por tipo de vehículo y tipo de cobro (Hora, Minuto, Fracción, Día).
- **Descuentos**: Posibilidad de aplicar cortesías o descuentos manuales al momento del cobro.

### 4.3 Usuarios y Roles
- **Administrador**: Acceso total para configurar tarifas, gestionar usuarios y ver estadísticas.
- **Operador**: Enfocado en la operatividad de entradas, salidas y consulta de disponibilidad.

## 5. Modelo Entidad-Relación (MER)
El sistema utiliza las siguientes entidades principales según lo dictado en el diseño:
- `ROLES`: (id, nombre, descripcion)
- `USUARIOS`: (id, nombre, email, password_hash, rol_id, activo, fecha_creacion)
- `TIPOS_VEHICULO`: (id, nombre)
- `ESPACIOS`: (id, codigo, tipo_vehiculo_id, disponible)
- `TARIFAS`: (id, tipo_vehiculo_id, tipo_cobro, valor, activo, fecha_inicio, fecha_fin)
- `REGISTROS`: (id, placa, entrada, salida, estado, espacio_id, tipo_vehiculo_id, userId)
- `TICKETS`: (id, codigo_unico, registro_id, minutos, valor, fecha_emision)

## 6. Casos de Uso Principales
1. **CU-01 Autenticación**: El usuario ingresa credenciales (email/contraseña), el sistema valida mediante `bcrypt` y otorga un token JWT.
2. **CU-02 Registro de Entrada**: El operador ingresa placa; el sistema verifica cupos, asigna espacio y marca el registro como `ACTIVO`.
3. **CU-03 Registro de Salida y Cobro**: El sistema calcula la diferencia entre entrada y salida, aplica la tarifa vigente y genera un ticket con el total a pagar.

## 7. Manual de Instalación y Despliegue
El proyecto se encuentra desplegado y funcional en: **URL DE VERCEL AQUÍ**

### Despliegue Local
1. Clonar el repositorio: `git clone https://github.com/BrachoDB/sistema-parqueadero.git`
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno en `.env`.
4. Ejecutar el seed de base de datos: `npm run force-seed`
5. Iniciar servidor: `npm start`

---
**Fecha de Entrega:** Mayo 2026
**Integrantes:** BrachoDB (Líder de Proyecto)
