const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  try {
    const res = await fetch(`${supabaseUrl}/projects?select=slug,client,blocks`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      for (const p of data) {
        if (p.slug === '__settings__') continue;
        console.log(`\nProject: ${p.client} (${p.slug})`);
        const blocks = typeof p.blocks === 'string' ? JSON.parse(p.blocks) : p.blocks;
        console.log(`Block count: ${blocks ? blocks.length : 0}`);
        if (blocks && blocks.length > 0) {
          console.log('First 2 blocks:', blocks.slice(0, 2).map(b => ({ type: b.type, hasContainer: b.hasContainer, textPreview: b.text ? b.text.substring(0, 60) + '...' : undefined })));
        }
      }
    } else {
      console.error('Fetch error:', await res.text());
    }
  } catch (err) {
    console.error(err);
  }
}

main();
