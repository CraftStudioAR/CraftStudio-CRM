const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  try {
    const res = await fetch(`${supabaseUrl}/projects?slug=eq.etiqueta-emily-dickinson&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      console.log('Emily record count:', data.length);
      if (data.length > 0) {
        console.log('Emily blocks type:', typeof data[0].blocks);
        console.log('Emily blocks:', data[0].blocks);
      }
    } else {
      console.error(await res.text());
    }
  } catch (e) {
    console.error(e);
  }
}

main();
