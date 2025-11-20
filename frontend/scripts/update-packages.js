import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');

// Clear existing DATABASE_URL to ensure we load the one from .env.local
if (process.env.DATABASE_URL) {
    delete process.env.DATABASE_URL;
}

dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function main() {
  console.log('Actualizando paquetes de créditos...');

  // Definir los nuevos paquetes con estética espartana
  const packages = [
    {
      name: 'Paquete Iniciación',
      credits: 5,
      price: 10000,
      is_active: true,
    },
    {
      name: 'Paquete Guerrero',
      credits: 20,
      price: 30000,
      is_active: true,
    },
    {
      name: 'Paquete Leónidas',
      credits: 100,
      price: 100000,
      is_active: true,
    },
  ];

  // Desactivar paquetes antiguos (opcional, o borrarlos)
  // await prisma.creditPackage.updateMany({ data: { is_active: false } });
  // Para este caso, vamos a borrar los existentes y crear los nuevos para limpiar la tabla
  // OJO: En producción real, mejor hacer update o soft delete para no romper historial de compras.
  // Como es desarrollo/setup inicial, podemos limpiar o hacer upsert.
  
  // Vamos a usar upsert basado en el nombre o crear si no existe.
  // Dado que no tenemos un unique constraint en name en el schema visible,
  // vamos a borrar todo y recrear para asegurar que queden SOLO estos 3.
  
  console.log('Limpiando paquetes antiguos...');
  await prisma.creditPackage.deleteMany({});

  console.log('Creando nuevos paquetes...');
  for (const pkg of packages) {
    await prisma.creditPackage.create({
      data: pkg,
    });
    console.log(`Creado: ${pkg.name} - ${pkg.credits} créditos - $${pkg.price}`);
  }

  console.log('¡Paquetes actualizados con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
