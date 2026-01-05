const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Map slugs to their new image files
const imageMapping = {
    // Entrenamiento (Fitness)
    'rutina-corta-ejercicios-hombres-sin-tiempo': '/images/blog/blog_rutina_ejercicios_1767539449757.png',
    'mejores-suplementos-gimnasio-hombres-principiantes': '/images/blog/blog_suplementos_gym_1767539463949.png',
    'entrenamiento-fuerza-hombres-40-anos': '/images/blog/blog_fuerza_40_1767539477961.png',

    // Estilo y Presencia (Style)
    'ropa-oficina-hombre-casual-elegante': '/images/blog/blog_armario_capsula_1767539507892.png',
    'estilos-de-barba-para-cara-redonda-cuadrada': '/images/blog/blog_estilos_barba_1767539522849.png',
    'como-combinar-zapatillas-con-ropa-formal-hombre': '/images/blog/blog_zapatillas_traje_1767539540475.png',

    // Mentalidad (Mindset)
    'como-ser-mas-disciplinado-en-la-vida': '/images/blog/blog_disciplina_spartan_1767539574372.png',
    'rutina-de-manana-para-hombres-exitosos': '/images/blog/blog_rutina_manana_1767539588985.png',
    'ejercicios-estoicismo-control-emociones': '/images/blog/blog_control_ira_1767539603270.png',
    'hacer-amigos-hombres-adultos-valores': '/images/blog/blog_circulo_hierro_1767539617845.png',

    // Productividad
    'rutina-de-noche-para-dormir-mejor-hombres': '/images/blog/blog_rutina_noche_1767539647735.png',
    'tecnicas-de-concentracion-para-estudiar-y-trabajar': '/images/blog/blog_deep_work_1767539662356.png',
    'herramientas-inteligencia-artificial-productividad-trabajo': '/images/blog/blog_chatgpt_ia_1767539676624.png',
};

async function main() {
    console.log('Updating blog post images...');

    for (const [slug, imagePath] of Object.entries(imageMapping)) {
        try {
            const result = await prisma.blogPost.update({
                where: { slug },
                data: { cover_image: imagePath },
            });
            console.log(`✅ Updated: ${slug}`);
        } catch (e) {
            console.error(`❌ Error updating ${slug}:`, e.message);
        }
    }

    console.log('Done!');
    await prisma.$disconnect();
}

main();
