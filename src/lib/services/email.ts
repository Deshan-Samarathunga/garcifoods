import { ServerClient } from "postmark";
import { Resend } from "resend";

import { env } from "@/lib/env";
import type { InquiryDto } from "@/lib/services/inquiries";

export type EmailDeliveryResult =
  | { provider: "resend" | "postmark"; delivered: true }
  | { provider: "none"; delivered: false; reason: string };

const buildInquiryText = (inquiry: InquiryDto) => {
  return [
    "New Garci website inquiry",
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `Subject: ${inquiry.subject}`,
    `Received: ${inquiry.createdAt}`,
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
};

const buildInquiryHtml = (inquiry: InquiryDto) => {
  return `
    <h1>New Garci website inquiry</h1>
    <p><strong>Name:</strong> ${inquiry.name}</p>
    <p><strong>Email:</strong> ${inquiry.email}</p>
    <p><strong>Subject:</strong> ${inquiry.subject}</p>
    <p><strong>Received:</strong> ${inquiry.createdAt}</p>
    <p><strong>Message:</strong></p>
    <p>${inquiry.message.replace(/\n/g, "<br />")}</p>
  `;
};

export const sendInquiryNotification = async (
  inquiry: InquiryDto,
): Promise<EmailDeliveryResult> => {
  const to = env.contactToEmail;
  const text = buildInquiryText(inquiry);
  const html = buildInquiryHtml(inquiry);

  if (env.resendApiKey && env.resendFromEmail) {
    const resend = new Resend(env.resendApiKey);
    await resend.emails.send({
      from: env.resendFromEmail,
      to,
      replyTo: inquiry.email,
      subject: `[Garci] ${inquiry.subject}`,
      text,
      html,
    });

    return { provider: "resend", delivered: true };
  }

  if (env.postmarkServerToken && env.postmarkFromEmail) {
    const client = new ServerClient(env.postmarkServerToken);
    await client.sendEmail({
      From: env.postmarkFromEmail,
      To: to,
      ReplyTo: inquiry.email,
      Subject: `[Garci] ${inquiry.subject}`,
      TextBody: text,
      HtmlBody: html,
    });

    return { provider: "postmark", delivered: true };
  }

  return {
    provider: "none",
    delivered: false,
    reason: "No email provider credentials are configured.",
  };
};
