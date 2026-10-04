import { NextResponse } from "next/server";

type SongRequestBody = {
  name?: unknown;
  phone?: unknown;
  song?: unknown;
};

export async function POST(request: Request) {
  try {
    const body: unknown =
      await request.json();

    if (
      !body ||
      typeof body !== "object"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid song request is required.",
        },
        {
          status: 400,
        }
      );
    }

    const values =
      body as SongRequestBody;

    /*
     * Validate types
     */
    if (
      typeof values.name !==
        "string" ||
      typeof values.phone !==
        "string" ||
      typeof values.song !==
        "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, phone number and song are required.",
        },
        {
          status: 400,
        }
      );
    }

    const name =
      values.name.trim();

    const phone =
      values.phone.trim();

    const song =
      values.song.trim();

    const phoneDigits =
      phone.replace(/\D/g, "");

    /*
     * Required validation
     */
    if (
      !name ||
      !phone ||
      !song
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Name, phone number and song are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Length + phone validation
     */
    if (
      name.length > 100 ||
      phone.length > 30 ||
      song.length > 200 ||
      !/^\+?[\d\s().-]+$/.test(
        phone
      ) ||
      phoneDigits.length < 7 ||
      phoneDigits.length > 15
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please check your name, phone number and song details.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ==========================================================
     * REQUEST ACCEPTED
     * ==========================================================
     *
     * IMPORTANT:
     * This does NOT redirect to the old Zero FM/Wix site.
     * This does NOT open Radio.co.
     * This does NOT load the old request widget.
     *
     * The request is accepted by this application's API.
     *
     * If you later connect a database / admin request queue,
     * this is the place where the request should be saved.
     */

    console.log(
      "[ZERO FM] Song request received:",
      {
        name,
        phone,
        song,
        receivedAt:
          new Date().toISOString(),
      }
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "Your request has been received by ZERO FM. It has not been sent to Radio.co and is only recorded in the server logs for now.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Request song error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Unable to submit song request.",
      },
      {
        status: 500,
      }
    );
  }
}