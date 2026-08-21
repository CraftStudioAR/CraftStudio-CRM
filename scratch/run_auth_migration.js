import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';

const DESCRIPTIONS = {
  'yokoo-studio': "Yokoo Studio atravesaba una etapa de crecimiento y necesitaba que su comunicación evolucionara al mismo ritmo que el negocio. Entre 2023 y septiembre de 2025 trabajamos de forma cercana con los fundadores y en articulación con las distintas áreas de la marca, desarrollando una estrategia de comunicación con enfoque en Growth Marketing.",
  'nomade-cafe': "Luego de su rebranding, Nómade necesitaba transformar su nueva identidad en una comunicación que conectara con las personas. Trabajamos junto al equipo de la marca para desarrollar una estrategia de contenido que diera continuidad al nuevo posicionamiento, llevando esa identidad al día a día a través de fotografía, video y una línea editorial coherente.",
  'adon-management': "Realizada en colaboración con Adon, esta producción nace de la búsqueda por desarrollar un lenguaje visual de carácter editorial. Más que retratar modelos, el objetivo fue construir una serie de imágenes con una identidad estética definida, donde cada decisión de arte, estilismo y composición aportara a una narrativa común.",
  'etiqueta-emily-dickinson': "Este proyecto nace como un homenaje a Emily Dickinson y a uno de sus poemas más emblemáticos: Hope is the thing with feathers. Más que diseñar una etiqueta, el objetivo fue transformar una obra literaria en una experiencia visual capaz de transmitir la sensibilidad de la autora y convertir la botella en un objeto narrativo."
};

async function main() {
  // Create client
  const supabase = createClient(supabaseUrl, anonKey);

  console.log('Signing in to Supabase...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'hola@craftstudio.com.ar',
    password: 'CraftStudio1!'
  });

  if (authError) {
    console.error('Authentication failed:', authError.message);
    return;
  }

  console.log('Signed in successfully! Session token obtained.');

  for (const [slug, text] of Object.entries(DESCRIPTIONS)) {
    console.log(`\nProcessing ${slug}...`);

    // 1. Fetch current blocks
    const { data: records, error: fetchError } = await supabase
      .from('projects')
      .select('blocks, client')
      .eq('slug', slug);

    if (fetchError) {
      console.error(`Failed to fetch ${slug}:`, fetchError.message);
      continue;
    }

    if (!records || records.length === 0) {
      console.error(`Project ${slug} not found.`);
      continue;
    }

    const project = records[0];
    let blocks = typeof project.blocks === 'string' ? JSON.parse(project.blocks) : project.blocks || [];

    // 2. Check if text block already exists
    const alreadyHasDescription = blocks.some(b => b.type === 'text' && b.text && b.text.includes(text.substring(0, 30)));

    if (alreadyHasDescription) {
      console.log(`Already has description block. Checking position...`);
      const currentIdx = blocks.findIndex(b => b.type === 'text' && b.text && b.text.includes(text.substring(0, 30)));
      if (currentIdx !== 1 && blocks.length > 1) {
        console.log(`Moving block to index 1...`);
        const descBlock = blocks.splice(currentIdx, 1)[0];
        blocks.splice(1, 0, descBlock);
      } else {
        console.log(`Position is correct.`);
        continue;
      }
    } else {
      console.log(`Inserting description block at index 1...`);
      const descBlock = {
        type: "text",
        text: text,
        hasContainer: true,
        widthMode: "standard",
        align: "left",
        fontFamily: "sans",
        bold: false,
        italic: false,
        sizeMobile: "text-lg",
        sizeTablet: "text-xl",
        sizeDesktop: "text-2xl",
        tracking: "tracking-normal",
        leading: "leading-relaxed"
      };

      if (blocks.length > 0) {
        blocks.splice(1, 0, descBlock);
      } else {
        blocks.push(descBlock);
      }
    }

    // 3. Update Supabase under authenticated session
    const { data: updateData, error: updateError } = await supabase
      .from('projects')
      .update({ blocks: blocks })
      .eq('slug', slug)
      .select();

    if (updateError) {
      console.error(`Failed to update ${slug}:`, updateError.message);
    } else {
      console.log(`Successfully updated blocks for ${project.client}! Returned records:`, updateData.length);
    }
  }

  console.log('\nAll operations complete!');
}

main();
