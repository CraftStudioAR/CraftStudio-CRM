const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  console.log('Fetching all projects from Supabase...');
  try {
    const res = await fetch(`${supabaseUrl}/projects?select=slug,client,description,blocks`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }

    const projects = await res.json();
    console.log(`Found ${projects.length} projects in database.`);

    for (const project of projects) {
      const desc = project.description;
      
      // If there is a description and it is NOT a JSON string (i.e. it doesn't start with '{')
      if (desc && desc.trim() && !desc.trim().startsWith('{')) {
        console.log(`Migrating description for "${project.client}" (${project.slug})...`);
        
        let blocks = [];
        if (typeof project.blocks === 'string') {
          blocks = JSON.parse(project.blocks);
        } else if (Array.isArray(project.blocks)) {
          blocks = project.blocks;
        }

        // Prepend the description as a text block with container
        const newTextBlock = {
          type: 'text',
          text: desc.trim(),
          hasContainer: true,
          widthMode: 'standard',
          fontFamily: 'serif',
          align: 'left'
        };

        blocks.unshift(newTextBlock);

        // Update the project in the database: set blocks and clear description
        const updateRes = await fetch(`${supabaseUrl}/projects?slug=eq.${project.slug}`, {
          method: 'PATCH',
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            blocks: blocks,
            description: '' // Clear description so it doesn't get picked up again
          })
        });

        if (updateRes.ok) {
          console.log(`Successfully migrated description for "${project.client}" to blocks!`);
        } else {
          console.error(`Failed to update "${project.client}":`, await updateRes.text());
        }
      } else {
        console.log(`No plain text description to migrate for "${project.client}" (${project.slug}).`);
      }
    }
    console.log('Migration finished successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  }
}

main();
