const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  try {
    const slug = 'etiqueta-emily-dickinson';
    const fetchRes = await fetch(`${supabaseUrl}/projects?slug=eq.${slug}&select=blocks,client`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    
    const records = await fetchRes.json();
    let blocks = records[0].blocks;
    if (typeof blocks === 'string') blocks = JSON.parse(blocks);
    
    // Add dummy text block at index 1
    const testBlock = {
      type: "text",
      text: "Test Description Block",
      hasContainer: true,
      widthMode: "standard"
    };
    blocks.splice(1, 0, testBlock);
    
    const updateRes = await fetch(`${supabaseUrl}/projects?slug=eq.${slug}`, {
      method: 'PATCH',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        blocks: blocks
      })
    });
    
    console.log('PATCH Status:', updateRes.status);
    console.log('PATCH Response:', await updateRes.json());
  } catch (e) {
    console.error(e);
  }
}

main();
