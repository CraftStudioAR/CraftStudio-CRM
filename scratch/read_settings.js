const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  try {
    const res = await fetch(`${supabaseUrl}/projects?slug=eq.__settings__&select=*`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.length > 0) {
        console.log('Settings description:', data[0].description);
      } else {
        console.log('__settings__ row not found.');
      }
    } else {
      console.error(await res.text());
    }
  } catch (e) {
    console.error(e);
  }
}

main();
