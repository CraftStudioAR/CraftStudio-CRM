const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';
const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co/rest/v1';

async function main() {
  try {
    console.log('Querying projects columns...');
    const projRes = await fetch(`${supabaseUrl}/projects?select=*&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (projRes.ok) {
      const projs = await projRes.json();
      if (projs.length > 0) {
        console.log('Projects keys:', Object.keys(projs[0]));
      } else {
        console.log('No projects found to check keys.');
      }
    } else {
      console.error('Projects query failed:', await projRes.text());
    }

    console.log('\nQuerying articles columns...');
    const artRes = await fetch(`${supabaseUrl}/craft_lab_articles?select=*&limit=1`, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    });
    if (artRes.ok) {
      const arts = await artRes.json();
      if (arts.length > 0) {
        console.log('Articles keys:', Object.keys(arts[0]));
      } else {
        console.log('No articles found to check keys.');
      }
    } else {
      console.error('Articles query failed:', await artRes.text());
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
