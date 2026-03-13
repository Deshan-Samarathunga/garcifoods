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

const serializeInquiry = (inquiry: {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}): InquiryDto => {
  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject,
    message: inquiry.message,
    createdAt: inquiry.createdAt.toISOString(),
  };
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

  return serializeInquiry(inquiry);
};

export const listAdminInquiries = async (limit?: number): Promise<InquiryDto[]> => {
  const prisma = getPrismaClient();
  const inquiries = await prisma.inquiry.findMany({
    orderBy: [{ createdAt: "desc" }],
    ...(typeof limit === "number" ? { take: limit } : {}),
  });

  return inquiries.map(serializeInquiry);
};

export const countRecentAdminInquiries = async (days: number): Promise<number> => {
  const prisma = getPrismaClient();
  const since = new Date(Date.now() - days * 86_400_000);

  return prisma.inquiry.count({
    where: {
      createdAt: {
        gte: since,
      },
    },
  });
};
