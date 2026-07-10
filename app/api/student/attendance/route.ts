import { NextResponse } from "next/server";
import { submitAttendance } from "@/app/actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { studentId, labRoom, timestamp, signature, roomPin } = body;

    if (!studentId || !labRoom || !timestamp || !signature || !roomPin) {
      return NextResponse.json(
        { success: false, message: "Missing required attendance parameters." },
        { status: 400 }
      );
    }

    const result = await submitAttendance({
      studentId,
      labRoom,
      timestamp,
      signature,
      roomPin,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: true, message: result.message },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Internal server error during attendance verification." },
      { status: 500 }
    );
  }
}