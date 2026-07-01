// Netlify Function: fires on every form submission (built-in "submission-created" event).
// For consultant-application submissions, sends an auto-reply to the applicant via Resend.

const FROM = "Big Room Tech <noreply@bigroomtech.com>";
const REPLY_TO = "info@bigroomtech.com";

const buildAutoReplyHtml = (firstName) => `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#111;max-width:560px;line-height:1.6;font-size:15px;">
    <p>Hi ${firstName || "there"},</p>
    <p>Thanks for applying to join the <strong>Big Room Tech</strong> consultant network — we've received your details and CV.</p>
    <p>Our team will review your application and, if there's a fit with our current or upcoming client needs, we'll be in touch shortly to arrange a short vetting call.</p>
    <p>In the meantime, feel free to explore our work at <a href="https://bigroomtech.com">bigroomtech.com</a>.</p>
    <p>Best,<br/>The Big Room Tech team</p>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
    <p style="font-size:12px;color:#888">Big Room Tech LLC · 111 NE 1st St, 8th Floor, Miami, FL 33132</p>
  </div>
`;

const buildAutoReplyText = (firstName) => `
Hi ${firstName || "there"},

Thanks for applying to join the Big Room Tech consultant network — we've received your details and CV.

Our team will review your application and, if there's a fit with our current or upcoming client needs, we'll be in touch shortly to arrange a short vetting call.

In the meantime, feel free to explore our work at https://bigroomtech.com.

Best,
The Big Room Tech team

—
Big Room Tech LLC · 111 NE 1st St, 8th Floor, Miami, FL 33132
`;

export default async (req) => {
  try {
    const body = await req.json();
    const payload = body?.payload || {};
    const formName = payload.form_name;

    if (formName !== "consultant-application") {
      return new Response("Ignored (not consultant-application)", { status: 200 });
    }

    const data = payload.data || {};
    const applicantEmail = data.email;
    const firstName = data.firstName;

    if (!applicantEmail) {
      console.warn("submission-created: no applicant email on payload");
      return new Response("No applicant email", { status: 200 });
    }

    const apiKey = Netlify.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("submission-created: RESEND_API_KEY env var missing");
      return new Response("Missing RESEND_API_KEY", { status: 500 });
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: applicantEmail,
        reply_to: REPLY_TO,
        subject: "Thanks for applying — Big Room Tech",
        html: buildAutoReplyHtml(firstName),
        text: buildAutoReplyText(firstName),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Resend error:", res.status, errText);
      return new Response(`Resend error: ${res.status}`, { status: 502 });
    }

    return new Response("Auto-reply sent", { status: 200 });
  } catch (err) {
    console.error("submission-created error:", err);
    return new Response("Internal error", { status: 500 });
  }
};
