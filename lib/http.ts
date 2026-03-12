import { NextResponse } from "next/server";

export const jsonError = (message: string, status = 400, details?: unknown) => {
  return NextResponse.json(
    {
      ok: false,
      error: message,
      details,
    },
    { status },
  );
};

export const jsonOk = <T>(data: T, status = 200) => {
  return NextResponse.json(
    {
      ok: true,
      data,
    },
    { status },
  );
};
