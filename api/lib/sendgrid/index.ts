import sgClient from "@sendgrid/client";

type SaveContactParams = {
  email: string;
  confirmNumber: number;
};

export const saveContact = async ({
  email,
  confirmNumber,
}: SaveContactParams) => {
  const id = await getCustomFieldId("confirm_number");

  const body = {
    contacts: [
      {
        email,
        custom_fields: {
          [id]: confirmNumber,
        },
      },
    ],
  };

  return sgClient.request({
    url: "/v3/marketing/contacts",
    method: "PUT",
    body,
  });
};

export const getCustomFieldId = async (name: string) => {
  const response = await sgClient.request({
    url: "/v3/marketing/field_definitions",
    method: "GET",
  });

  return response[1].custom_fields.find((field: any) => field.name === name)
    ?.id;
};

export const getContact = async (email: string) => {
  try {
    const body = { emails: [email] };

    const response = await sgClient.request({
      url: `/v3/marketing/contacts/search/emails`,
      method: "POST",
      body,
    });

    return response?.[1]?.result?.[email]?.contact;
  } catch (error) {
    return null;
  }
};

export const saveContactToList = async (email: string, listId: string) => {
  const body = {
    list_ids: [listId],
    contacts: [{ email }],
  };

  return sgClient.request({
    url: "/v3/marketing/contacts",
    method: "PUT",
    body,
  });
};

export const getListId = async (name: string) => {
  const response = await sgClient.request({
    url: "/v3/marketing/lists",
    method: "GET",
  });

  return response[1].result.find((list: any) => list.name === name)?.id;
};
