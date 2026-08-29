require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log("URL:", supabaseUrl ? "OK " + supabaseUrl.slice(0,30) : "MISSING");
console.log("KEY:", supabaseKey ? "OK len=" + supabaseKey.length : "MISSING");

const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/test', (req,res)=> res.json({ok:true, time:new Date()}));

app.post('/api/users/create', async (req,res)=>{
  const shomina_id = 'SHO-' + Math.random().toString(36).substring(2,6).toUpperCase();
  const { data, error } = await supabase.from('ghost_users').insert({ shomina_id }).select().single();
  if(error) return res.json({error:error.message});
  res.json(data);
});

app.listen(3000, '0.0.0.0', ()=> console.log('✅ Shomina Final Server on 3000 - http://localhost:3000'));
