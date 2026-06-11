# REM Backend

Proyecto Spring Boot para la API REST de Rem.

## Requisitos

- Java 17
- Maven

## Cómo ejecutar

1. Abrir terminal en `backend`
2. Ejecutar:

```bash
mvn spring-boot:run
```

La API quedará en `http://localhost:8080`.

## Endpoints disponibles

- `GET /api/personas` - lista todas las personas
- `GET /api/personas/{id}` - obtiene una persona
- `POST /api/personas` - crea una persona
- `GET /api/medicamentos/{personaId}` - lista medicamentos de una persona
- `POST /api/medicamentos/{personaId}` - agrega medicamento a una persona

## Base de datos

- H2 en archivo local: `backend/data/remdb`
- Consola H2: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:file:./data/remdb`
- Usuario: `sa`
- Contraseña: vacía
