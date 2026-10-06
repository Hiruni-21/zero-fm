import type { Metadata } from "next";

import LegalPage from "../components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Zero FM",
  description: "How Zero FM handles your information on the website and apps.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 2026"
      sections={[
        {
          title: "General Privacy Information",
          body: (
            <>
              <p>
                All copyrighted music played on Zero FM is owned by its original
                authors and is used as &ldquo;Fair use&rdquo;, to entertain our
                audience as a non-commercialized and non-profit community
                service.
              </p>
              <p>
                When connecting to our radio stream &ldquo;www.zerofm.live&rdquo;,
                your IP address will be sent to our radio service provider in
                order for us to track listening trends and provide licensing
                bodies with royalty reports. Once our service provider receives
                your IP it is immediately anonymized, deleted and becomes
                untraceable. This data is never sold on or passed to other
                companies.
              </p>
            </>
          ),
        },
        {
          title: "Song Requests",
          body: (
            <>
              <p>
                When you request a song on our website or app, the song you
                pick is sent to our radio service provider so it can be added
                to the on-air queue. If you use the request form, we also ask
                for your name and phone number so the studio can recognise your
                request. We use these only to handle your request. They are
                never sold or passed to other companies.
              </p>
              <p>
                To keep requests fair, your website browser or phone remembers
                when you last made a request. This stays on your own device.
              </p>
            </>
          ),
        },
        {
          title: "Android Apps",
          body: (
            <>
              <p className="font-semibold text-white">For Android Apps:</p>
              <p>
                The &ldquo;Zero FM&rdquo; Android App does not collect any user
                data during use. In order to provide audio control during Phone
                App use, the App will monitor the state of the phone App (Idle,
                in call, call ended) if applicable on your device. At no point
                will the App be able to listen in or derive phone numbers or
                data. The Android App also requires access to local storage.
                This is to store its configuration for faster launch times.
              </p>
            </>
          ),
        },
        {
          title: "iOS Apps",
          body: (
            <>
              <p className="font-semibold text-white">For iOS Apps:</p>
              <p>
                The ZeroFM.Live iOS App does not collect any user data when
                installed or launched on your device.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
