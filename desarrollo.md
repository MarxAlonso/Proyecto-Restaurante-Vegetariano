1. el sistema debe aplicar los criterios de la iso iec 25010 mediante pruebas automatizadas que lo validen
2. pruebas de integracion que validen la interoperabilidad y coexistencia del sistema con servicio o sistemas externos
bueno solo verifica eso y lo integras,


3. usare cloudlfare r2 para el almacenamiento de imagenes, donde el admin subira los platillos, asi que debemos crear ese apartado para subir imagenes del platillo, el precio, crear la descripcion del platillo, el menu de los dias, y la categoria, nosotros tambien debemos crear las categorias para integrar en el menu, ya sea categoria de pollos, carnes, parrillas, bebidas, bebidas alcoholidas, postres, ensaladas y asi.
2 Object Storage
High-performance storage for files and objects with zero egress charges.

Search buckets...

You haven't created a bucket yet.
Get up to 10GB of storage, 1 million Class A operations, and 10 million Class B operations free every month with R2.
Usage
June 1 - June 4

Class A Operations
0

Class B Operations
0

Total storage
0 B
Account Details
API Tokens

Account ID : 05f3313167fef77fa75db55dfc5cd315
S3 API https://05f3313167fef77fa75db55dfc5cd315.r2.cloudflarestorage.com

dame una guia para crear el bucket

Crear un cubo
Para empezar, crea un nuevo bucket vacío. Podrás añadir datos a tu bucket mediante el panel de control o la interfaz de línea de comandos de Wrangler .

Nombre del cubo
restaurante-veg
El nombre del bucket es permanente

Ubicación:
Automático
Hemos decidido ubicar tu cubo en el este de Norteamérica . Si prefieres una ubicación diferente, indícanosla.


Proporcionar una pista de ubicación (opcional)
Especificar jurisdicción
Los buckets de R2 pueden restringirse a una jurisdicción específica para cumplir con los requisitos de residencia de datos. Las ubicaciones dentro de la jurisdicción especificada se seleccionarán automáticamente.

Clase de almacenamiento predeterminada :
Estándar
Recomendado para objetos a los que se accederá al menos una vez al mes. ya cree el bucke en cloudflare 


Name:
restaurante-veg

Created:
Jun 3, 2026
Location:
Eastern North America (ENAM)
S3 API: https://05f3313167fef77fa75db55dfc5cd315.r2.cloudflarestorage.com/restaurante-veg

guiame con ello, pero tambien creas las paginas para crear los menus y subirlos, aplicar crud de los menus y categorias