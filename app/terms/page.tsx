import type { Metadata } from "next";

import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Zero FM",
  description: "The terms for using the Zero FM website, apps and song requests.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="October 2026"
      sections={[
        {
          title: "Using Zero FM",
          body: (
            <p>
              Zero FM is a free, non-profit community radio service. By
              listening on our website or apps you agree to these terms. The
              service is for personal listening only, not for re-broadcasting
              or any commercial use.
            </p>
          ),
        },
        {
          title: "Song Requests",
          body: (
            <>
              <p>
                Song requests are suggestions to our studio. We try to play as
                many as we can, but we can&rsquo;t promise when, or whether, a
                requested song will be played.
              </p>
              <p>
                To keep things fair for every listener, each person can make
                one request every 30 minutes and up to 5 requests a day. Please
                don&rsquo;t try to get around these limits or send offensive
                names or messages.
              </p>
            </>
          ),
        },
        {
          title: "Music and Content",
          body: (
            <p>
              All music played on Zero FM belongs to its original authors. You
              may not record, copy or redistribute our stream. The Zero FM name,
              logo and the content of this website belong to Zero FM.
            </p>
          ),
        },
        {
          title: "Availability",
          body: (
            <p>
              We work to keep Zero FM on air 24 hours a day, but the stream,
              website or apps may sometimes be unavailable because of
              maintenance or problems outside our control. The service is
              provided as it is, and Zero FM is not responsible for any loss
              caused by an interruption.
            </p>
          ),
        },
        {
          title: "Changes and Contact",
          body: (
            <>
              <p>
                We may update these terms from time to time. The latest version
                will always be on this page.
              </p>
              <p>
                Questions? Call our hotline or message the studio on WhatsApp
                at{" "}
                <a
                  href="tel:+94727170170"
                  className="text-[#FFD400] underline-offset-4 hover:underline"
                >
                  072 717 0170
                </a>
                .
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
