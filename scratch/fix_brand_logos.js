import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cbkrzseukklabotsmclt.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNia3J6c2V1a2tsYWJvdHNtY2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3OTczMTksImV4cCI6MjEwMjM3MzMxOX0.Oo4p2KHvoxJ770GCQl0EIhWxfc1mJ581ggMxvnosQZA';

const defaultLogos = [
  { publicId: 'yokoo_jdzsmb', alt: 'Yokoo Studio' },
  { publicId: 'sunkiss_l22ice', alt: 'Sunkiss' },
  { publicId: 'nomade_zhi6vi', alt: 'Nómade Café' },
];

async function main() {
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

  // Fetch settings
  const { data: records, error: fetchError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', '__settings__');

  if (fetchError) {
    console.error('Fetch error:', fetchError.message);
    return;
  }

  if (records.length === 0) {
    console.log('No settings row found. Nothing to patch.');
    return;
  }

  const settings = records[0];
  let parsed = {};
  if (settings.description) {
    try {
      parsed = JSON.parse(settings.description);
    } catch (e) {}
  }

  // Insert default logos if missing or empty
  parsed.brandLogos = defaultLogos;

  const { error: updateError } = await supabase
    .from('projects')
    .update({ description: JSON.stringify(parsed) })
    .eq('slug', '__settings__');

  if (updateError) {
    console.error('Update failed:', updateError.message);
  } else {
    console.log('Successfully updated settings row with default brandLogos!');
  }
}

main();
