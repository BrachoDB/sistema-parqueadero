# 🅿️ Sistema Web para Control de Parqueadero
**SENA - NODO TIC | ADSO 17**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://sistema-parqueadero-olive.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=flat&logo=node.js)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-Aiven_Cloud-blue?style=flat&logo=mysql)](https://aiven.io)

---

## 1. Introducción
Este es un sistema web robusto diseñado para la gestión integral de parqueaderos. Permite controlar la entrada y salida de vehículos, automatizar cobros según tarifas dinámicas y monitorear la disponibilidad de espacios en tiempo real.

## 2. Tecnologías
- **Backend:** Node.js, Express, Sequelize (ORM).
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript ES6+.
- **Base de Datos:** MySQL (Aiven Cloud).
- **Seguridad:** JWT (JSON Web Tokens) y Bcryptjs para encriptación.
- **Despliegue:** Vercel (Full Stack Deployment).

## 3. Requisitos Funcionales (SENA)
- ✅ **Gestión de Vehículos:** Registro de entrada y salida para Sedán, Camioneta y Motos.
- ✅ **Control de Cupos:** 30 espacios para autos y 15 para motos con actualización en tiempo real.
- ✅ **Tarifas Dinámicas:** Configuración por hora, minuto, fracción o día desde el panel administrativo.
- ✅ **Roles de Usuario:** Administrador (Gestión total) y Operario (Entradas/Salidas).
- ✅ **Ticket de Salida:** Generación de comprobante detallado con tiempo y costo.

## 4. Modelo Entidad-Relación (MER)
El diseño de la base de datos sigue el estándar relacional solicitado:
- **ROLES:** Definición de permisos.
- **USUARIOS:** Credenciales encriptadas y asociación de roles.
- **ESPACIOS:** Control de disponibilidad física.
- **REGISTROS:** Historial detallado de cada estancia vehicular.
- **TARIFAS:** Reglas de cobro por categoría de vehículo.

## 5. Instalación y Uso

### Despliegue en Vercel
1. Clonar este repositorio.
2. Configurar las variables de entorno (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`, `JWT_SECRET`).
3. Desplegar mediante el CLI de Vercel o GitHub Integration.

### Ejecución Local
1. Instalar dependencias: `npm install`
2. Configurar el archivo `.env`.
3. Inicializar la base de datos: `npm run force-seed`
4. Iniciar: `npm start`

---
**Desarrollado para:** SENA Nodo TIC - Programa ADSO.
**Proyecto:** Sistema Web para Control de Parqueadero.
