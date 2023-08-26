import express from "express";
import crypto from "node:crypto";
import sgMail, { MailDataRequired } from "@sendgrid/mail";
import sgClient from "@sendgrid/client";

import {
  getContact,
  getListId,
  saveContact,
  saveContactToList,
} from "./lib/sendgrid";

const sendgridKey = process.env.SENDGRID_API_KEY!;

sgMail.setApiKey(sendgridKey);
sgClient.setApiKey(sendgridKey);

const app = express();

const style = `<link rel="stylesheet" href="https://learnreact.io/styles.css" />`;

const mainLayout = (body: string) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover"
      />
      <title>learnreact.io</title>
      ${style}
    </head>
    <body>
      <header>
        <p class="site-title">
          <a href="/"> learnreact.io </a>
        </p>
      </header>

      <main>${body}</main>

      <footer> © <a href="/"> learnreact.io </a> </footer>
    </body>
  </html>
`;

app.get("/api/ping", (_req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.end(`Pong`);
});

app.post("/api/subscribe", async (req, res) => {
  const { email } = req.body;

  const confirmNumber = crypto.randomInt(1000000000, 10000000000);

  const parmas = new URLSearchParams({
    confirm_number: confirmNumber.toString(),
    email,
  });

  const confirmationURL = new URL(
    `/api/subscribe-confirm?${parmas.toString()}`,
    `${req.protocol}://${req.get("host")}`
  );

  const message: MailDataRequired = {
    to: email,
    from: "newsletter@learnreact.io",
    replyTo: "hello@mahmoudashraf.dev",
    subject: "Confirm your subscription",
    text: `Hello, \nThank you for subscribing to our newsletter. Please complete and confirm your subscription by clicking on the following link:\n ${confirmationURL}`,
    html: mainLayout(`Hello,
      <br>Thank you for subscribing to our newsletter.
      Please complete and confirm your subscription by 
      <a href="${confirmationURL}"> clicking here</a>.`),
  };

  await saveContact({ email, confirmNumber });
  await sgMail.send(message);

  res.end(
    mainLayout(`<div>
    <h3>Thank you for subscribing to our newsletter</h3>
    <p> please check your email <b>${email}</b> to confirm your subscription</p>
  </div>`)
  );
});

app.get("/api/subscribe-confirm", async (req, res) => {
  const { email, confirm_number } = req.query;
  const contact = await getContact(email as string);
  if (!contact) {
    res.end(
      mainLayout(`<div>
      <h3>Sorry, we couldn't find your email</h3>
      <p> please try again</p>
    </div>`)
    );

    return;
  }

  if (String(contact.custom_fields.confirm_number) !== String(confirm_number)) {
    res.end(
      mainLayout(`<div>
      <h3>Sorry, the confirmation number is incorrect</h3>
      <p> please try again</p>
    </div>`)
    );

    return;
  }

  const listId = await getListId("Newsletter Subscribers");

  await saveContactToList(email as string, listId);

  res.end(
    mainLayout(`<div>
    <h3>Thank you for confirming your subscription</h3>
    <p> you can now close this window</p>
  </div>`)
  );
});

export default app;
