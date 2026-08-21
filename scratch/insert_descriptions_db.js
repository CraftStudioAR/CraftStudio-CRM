const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

const DESCRIPTIONS = {
  'yokoo-studio': "Yokoo Studio atravesaba una etapa de crecimiento y necesitaba que su comunicación evolucionara al mismo ritmo que el negocio. Entre 2023 y septiembre de 2025 trabajamos de forma cercana con los fundadores y en articulación con las distintas áreas de la marca, desarrollando una estrategia de comunicación con enfoque en Growth Marketing.",
  'nomade-cafe': "Luego de su rebranding, Nómade necesitaba transformar su nueva identidad en una comunicación que conectara con las personas. Trabajamos junto al equipo de la marca para desarrollar una estrategia de contenido que diera continuidad al nuevo posicionamiento, llevando esa identidad al día a día a través de fotografía, video y una línea editorial coherente.",
  'adon-management': "Realizada en colaboración con Adon, esta producción nace de la búsqueda por desarrollar un lenguaje visual de carácter editorial. Más que retratar modelos, el objetivo fue construir una serie de imágenes con una identidad estética definida, donde cada decisión de arte, estilismo y composición aportara a una narrativa común.",
  'etiqueta-emily-dickinson': "Este proyecto nace como un homenaje a Emily Dickinson y a uno de sus poemas más emblemáticos: Hope is the thing with feathers. Más que diseñar una etiqueta, el objetivo fue transformar una obra literaria en una experiencia visual capaz de transmitir la sensibilidad de la autora y convertir la botella en un objeto narrativo."
};

async function main() {
  for (const [slug, text] of Object.entries(DESCRIPTIONS)) {
    try {
      console.log(`Processing project ${slug}...`);
      
      // 1. Fetch current blocks
      const fetchRes = await fetch(`${supabaseUrl}/projects?slug=eq.${slug}&select=blocks,client`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });
      
      if (!fetchRes.ok) {
        console.error(`Failed to fetch ${slug}:`, await fetchRes.text());
        continue;
      }
      
      const records = await fetchRes.json();
      if (records.length === 0) {
        console.error(`Project ${slug} not found in database.`);
        continue;
      }
      
      const project = records[0];
      let blocks = typeof project.blocks === 'string' ? JSON.parse(project.blocks) : project.blocks || [];
      
      // 2. Check if a text block with this content already exists
      const alreadyHasDescription = blocks.some(b => b.type === 'text' && b.text && b.text.includes(text.substring(0, 30)));
      
      if (alreadyHasDescription) {
        console.log(`Project ${slug} already has the description block. Checking position...`);
        // Ensure it is at index 1
        const currentIdx = blocks.findIndex(b => b.type === 'text' && b.text && b.text.includes(text.substring(0, 30)));
        if (currentIdx !== 1 && blocks.length > 1) {
          console.log(`Moving description block to index 1...`);
          const descBlock = blocks.splice(currentIdx, 1)[0];
          blocks.splice(1, 0, descBlock);
        } else {
          console.log(`Position is correct.`);
          continue;
        }
      } else {
        console.log(`Creating description block at index 1 for ${project.client}...`);
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
        
        // Insert at index 1 (under the first block/image)
        if (blocks.length > 0) {
          blocks.splice(1, 0, descBlock);
        } else {
          blocks.push(descBlock);
        }
      }
      
      // 3. Save back to Supabase
      const updateRes = await fetch(`${supabaseUrl}/projects?slug=eq.${slug}`, {
        method: 'PATCH',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          blocks: blocks,
          updated_at: new Date().toISOString()
        })
      });
      
      if (updateRes.ok) {
        console.log(`Successfully updated blocks for ${project.client}!`);
      } else {
        console.error(`Failed to update ${slug}:`, await updateRes.text());
      }
      
    } catch (err) {
      console.error(`Error processing ${slug}:`, err.message);
    }
  }
}

main();
