import { getPrismaClient } from "@/lib/db";
import { contactSubmissionSchema, type ContactSubmissionInput } from "@/lib/validations/contact";

export type InquiryDto = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export const createInquiry = async (input: ContactSubmissionInput): Promise<InquiryDto> => {
  const payload = contactSubmissionSchema.parse(input);
  const prisma = getPrismaClient();
  const inquiry = await prisma.inquiry.create({
    data: {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    },
  });

  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject,
    message: inquiry.message,
    createdAt: inquiry.createdAt.toISOString(),
  };
};
