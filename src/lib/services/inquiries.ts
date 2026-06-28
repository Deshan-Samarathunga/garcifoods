import { getDbPool } from "@/lib/db";
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
  const pool = getDbPool();
  const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  
  const { rows } = await pool.query(
    `INSERT INTO "Inquiry" (id, name, email, subject, message) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING id, name, email, subject, message, "createdAt"`,
    [id, payload.name, payload.email, payload.subject, payload.message]
  );

  return serializeInquiry(rows[0]);
};

export const listAdminInquiries = async (limit?: number): Promise<InquiryDto[]> => {
  const pool = getDbPool();
  let query = `SELECT id, name, email, subject, message, "createdAt" FROM "Inquiry" ORDER BY "createdAt" DESC`;
  const params: any[] = [];
  
  if (typeof limit === "number") {
    query += ` LIMIT $1`;
    params.push(limit);
  }

  const { rows } = await pool.query(query, params);
  return rows.map(serializeInquiry);
};

export const countRecentAdminInquiries = async (days: number): Promise<number> => {
  const pool = getDbPool();
  const since = new Date(Date.now() - days * 86_400_000);

  const { rows } = await pool.query(
    `SELECT COUNT(*) as count FROM "Inquiry" WHERE "createdAt" >= $1`,
    [since]
  );
  
  return parseInt(rows[0].count, 10);
};
