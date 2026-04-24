BACKEND
<img width="2559" height="1469" alt="image" src="https://github.com/user-attachments/assets/1b1c7f30-b207-4f3d-a197-bba65bad775b" />

Cómo correr el proyecto localmente (Frontend + Backend)

1. Clonar ambos repositorios
git clone
git clone

2. Backend
cd backend-WEB-Project1
npm install
Configurar PostgreSQL local:
Crear base de datos llamada series
Asegurarse de que esté corriendo
Ejecutar servidor:
node index.js
   Corre en: http://localhost:3000
3. Frontend
Abrir otra terminal:
cd frontend-WEB-Project1
Ejecutar con Live Server (VSCode)
o: python -m http.server
   Abrir: http://localhost:5500
   
5. IMPORTANTE
En app.js del frontend usar:
const API = "http://localhost:3000";

Challenges implementados
- Códigos HTTP correctos (201, 204, 404, 400) — 20 pts
- Validación server-side con errores en JSON — 20 pts
- Paginación con ?page= y ?limit= — 30 pts
- Búsqueda por nombre con ?q= — 15 pts
- Ordenamiento con ?sort= y ?order= — 15 pts

Total posible: 100pts

Reflexión

Trabajar con Express fue bastante directo, lo que más costó fue entender bien cómo estructurar las rutas y manejar los errores correctamente. También hubo varios bugs por cosas pequeñas como endpoints mal escritos o parámetros mal enviados, pero eso ayudó a entender mejor cómo funciona una API en la práctica.

El mayor reto fue cuando se hizo el deploy, porque el backend funcionaba localmente pero fallaba en producción por temas de conexión con la base de datos y variables de entorno.

Sí usaría esta tecnología otra vez porque es rápida y flexible para proyectos pequeños, aunque para algo más grande probablemente usaría algo más estructurado
