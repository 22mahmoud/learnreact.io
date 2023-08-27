import type { VercelRequest, VercelResponse } from "@vercel/node";
import sgMail from "@sendgrid/mail";
import sgClient from "@sendgrid/client";
import { getContact, getListId, saveContactToList } from "../_lib/sendgrid";
import { mainLayout } from "../_utils";

const sendgridKey = process.env.SENDGRID_API_KEY!;
sgMail.setApiKey(sendgridKey);
sgClient.setApiKey(sendgridKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
}
