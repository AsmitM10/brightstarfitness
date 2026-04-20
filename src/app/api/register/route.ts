// import { NextResponse } from "next/server";
// import { createSupabaseServerClient } from "@/lib/supabase/server";

// export async function POST(req: Request) {
//   try {
//     // ✅ Initialize Supabase server client inside handler
//     const supabase = createSupabaseServerClient();

//     const { username, whatsapp_no, referrer } = await req.json();

//     // Validation
//     if (!username || !whatsapp_no) {
//       return NextResponse.json(
//         { error: "Name and WhatsApp number are required" },
//         { status: 400 }
//       );
//     }

//     // Validate WhatsApp number format (Indian 10-digit)
//     const cleanNumber = whatsapp_no.replace(/\D/g, "");
//     if (cleanNumber.length !== 10 || !/^[6-9]\d{9}$/.test(cleanNumber)) {
//       return NextResponse.json(
//         { error: "Invalid WhatsApp number format" },
//         { status: 400 }
//       );
//     }

//     // Check if user already exists
//     const { data: existingUser, error: checkError } = await supabase
//       .from("user4")
//       .select("*")
//       .eq("whatsapp_no", cleanNumber)
//       .single();

//     if (checkError && checkError.code !== "PGRST116") {
//       console.error("Error checking existing user:", checkError);
//       return NextResponse.json(
//         { error: "Database error while checking user" },
//         { status: 500 }
//       );
//     }

//     if (existingUser) {
//       return NextResponse.json(
//         { error: "User with this WhatsApp number already exists" },
//         { status: 409 }
//       );
//     }

//     // Calculate last_date (7 days from registration)
//     const registrationDate = new Date();
//     const lastDate = new Date(registrationDate);
//     lastDate.setDate(lastDate.getDate() + 7);

//     // Prepare insert data
//     const insertData: any = {
//       username: username.trim(),
//       whatsapp_no: cleanNumber,
//       registration_date: registrationDate.toISOString(),
//       last_date: lastDate.toISOString(),
//       verified: false,
//       ...(referrer && { referrer }),
//     };

//     // Insert new user
//     const { data, error } = await supabase
//       .from("user4")
//       .insert([insertData])
//       .select()
//       .single();

//     if (error) {
//       console.error("Supabase insert error:", error);
//       return NextResponse.json({ error: error.message }, { status: 400 });
//     }

//     return NextResponse.json({
//       success: true,
//       user: data,
//       message: "Registration successful",
//     });

//   } catch (err: any) {
//     console.error("API error:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  // accept optional referrer slug for referral tracking
  const { username, whatsapp_no, referrer_slug } = await req.json()

  // generate a unique slug for the new user's dashboard/landing page
  const slug =
    username.replace(/\s+/g, "_").toLowerCase() +
    "_" +
    Date.now()

  // Calculate trial dates
  // Registration date is today
  const registrationDate = new Date()
  registrationDate.setHours(0, 0, 0, 0) // Normalize to start of day
  
  // Trial starts NEXT DAY after registration (not same day)
  const trialStartDate = new Date(registrationDate)
  trialStartDate.setDate(trialStartDate.getDate() + 1)
  
  // Trial runs for exactly 7 days (start day + 6 more days)
  const lastDate = new Date(trialStartDate)
  lastDate.setDate(lastDate.getDate() + 6)

  // insert user record into user4 (store referrer slug if provided)
  const insertPayload: any = {
    username,
    whatsapp_no,
    userpage_slug: slug,
    verified: false,
    registration_date: registrationDate.toISOString(),
    last_date: lastDate.toISOString(),
  }
  if (referrer_slug) {
    insertPayload.referrer = referrer_slug
  }

  const { data: newUser, error: insertErr } = await supabase
    .from("user4")
    .insert(insertPayload)
    .select()
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // create an entry in user5 for the new user (empty referrals list)
  await supabase.from("user5").insert({
    user_id: newUser.id,
    username: newUser.username,
    referrals: [],
  })

  // if the request included a referrer slug, link the referral
  if (referrer_slug) {
    try {
      const { data: refUser } = await supabase
        .from("user4")
        .select("id, username, userpage_slug")
        .eq("userpage_slug", referrer_slug)
        .single()

      if (refUser) {
        // update or insert referrer's user5 row
        const { data: existing, error: existingErr } = await supabase
          .from("user5")
          .select("id, referrals")
          .eq("user_id", refUser.id)
          .single()

        const newReferralValue = slug // store slug of the new user

        if (existingErr && existingErr.code !== "PGRST116") {
          console.error("Error fetching referrer row:", existingErr)
        } else if (existing) {
          const updated = [...(existing.referrals || []), newReferralValue]
          await supabase
            .from("user5")
            .update({ referrals: updated })
            .eq("id", existing.id)
        } else {
          await supabase.from("user5").insert({
            user_id: refUser.id,
            username: refUser.username,
            referrals: [newReferralValue],
          })
        }
      }
    } catch (err) {
      console.error("Referral tracking failed:", err)
    }
  }

  return NextResponse.json({ slug })
}
