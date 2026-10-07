const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !serviceKey || !anonKey) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function setup() {
  console.log("Setting up test users for 6B.4 tests...");
  
  const emailA = "test_user_6b4_a@happysoul.test";
  const emailB = "test_user_6b4_b@happysoul.test";
  const password = "TestPassword123!";

  // 1. Create User A if not exists
  const { data: usersList } = await adminClient.auth.admin.listUsers();
  let userA = usersList.users.find((u) => u.email === emailA);
  if (!userA) {
    const { data: createdA, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true,
    });
    if (errA) throw errA;
    userA = createdA.user;
  }

  // 2. Create User B if not exists
  let userB = usersList.users.find((u) => u.email === emailB);
  if (!userB) {
    const { data: createdB, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true,
    });
    if (errB) throw errB;
    userB = createdB.user;
  }

  console.log("User A ID:", userA.id);
  console.log("User B ID:", userB.id);

  // 3. Get session / access token for User A
  const anonClientA = createClient(supabaseUrl, anonKey);
  const { data: authA, error: loginErrA } = await anonClientA.auth.signInWithPassword({
    email: emailA,
    password: password,
  });
  if (loginErrA) throw loginErrA;

  // 4. Get session / access token for User B
  const anonClientB = createClient(supabaseUrl, anonKey);
  const { data: authB, error: loginErrB } = await anonClientB.auth.signInWithPassword({
    email: emailB,
    password: password,
  });
  if (loginErrB) throw loginErrB;

  console.log("Successfully logged in User A and User B!");
  console.log("User A access token snippet:", authA.session.access_token.substring(0, 20) + "...");
  console.log("User B access token snippet:", authB.session.access_token.substring(0, 20) + "...");

  // Create client bound to User A token
  const clientUserA = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
  });

  // Create client bound to User B token
  const clientUserB = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${authB.session.access_token}` } },
  });

  // Test RLS with User A client
  const { data: convA, error: convErrA } = await clientUserA
    .from("conversations")
    .insert({ user_id: userA.id, title: "Test Conv A" })
    .select()
    .single();

  if (convErrA) console.error("Conv insert error:", convErrA);
  else console.log("Created Conv A with RLS:", convA.id);

  // Try reading Conv A with User B client
  const { data: convReadByB, error: readErr } = await clientUserB
    .from("conversations")
    .select()
    .eq("id", convA.id);

  console.log("User B reading Conv A (should be empty array due to RLS):", convReadByB);

  // Cleanup test conv A
  await adminClient.from("conversations").delete().eq("id", convA.id);
  console.log("Cleanup complete.");
}

setup().catch((e) => console.error(e));
