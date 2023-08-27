import type { VercelRequest, VercelResponse } from "@vercel/node";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import sgClient from "@sendgrid/client";
import crypto from "node:crypto";

import { mainLayout } from "../_utils";
import { saveContact } from "../_lib/sendgrid";

const sendgridKey = process.env.SENDGRID_API_KEY!;
sgMail.setApiKey(sendgridKey);
sgClient.setApiKey(sendgridKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { email } = req.body;

  const confirmNumber = crypto.randomInt(1000000000, 10000000000);

  const parmas = new URLSearchParams({
    confirm_number: confirmNumber.toString(),
    email,
  });

  const confirmationURL = new URL(
    `/api/newsletter/confirm?${parmas.toString()}`,
    req.headers.origin
  );

  const message: MailDataRequired = {
    to: email,
    from: "newsletter@learnreact.io",
    replyTo: "hello@mahmoudashraf.dev",
    subject: "Confirm your subscription",
    text: `Hello, \nThank you for subscribing to our newsletter. Please complete and confirm your subscription by clicking on the following link:\n ${confirmationURL}`,
    html: `Hello,
         <br>Thank you for subscribing to our newsletter.
         Please complete and confirm your subscription by
         <a href="${confirmationURL}"> clicking here</a>.`,
  };

  await saveContact({ email, confirmNumber });
  await sgMail.send(message);

  res.end(
    mainLayout(`<div>
       <h3>Thank you for subscribing to our newsletter</h3>
       <p> please check your email <b>${email}</b> to confirm your subscription</p>
     </div>`)
  );
}
