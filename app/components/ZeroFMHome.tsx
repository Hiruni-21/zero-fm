"use client";

import React from "react";
import {
  LanguageProvider,
  useLanguage,
} from "./LanguageContext";

import MobileMenu from "./MobileMenu";
import CategoryModal from "./CategoryModal";
import PageEffects from "./PageEffects";
import {
  selectSection,
  useActiveSection,
} from "../lib/active-section";
import { requestPlay } from "../lib/ui-events";
import CategoryExplorer from "./CategoryExplorer";
import RadioPlayer from "./RadioPlayer";
import RequestSong from "./RequestSong";
import {
  fetchNowPlaying,
  NOW_PLAYING_POLL_MS,
} from "../lib/now-playing";


const ZERO_FM_LOGO =
  "https://static.wixstatic.com/media/273b94_1a0a6b9795b2404b9a6280ce4bb96514~mv2.png/v1/fill/w_190,h_98,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/brown.png";

const ZERO_FM_NAV_FOOTER_LOGO = "/images/zero-fm-logo.png";

const ZERO_FM_HERO_PHOTO = "/images/hero-zero-fm.png";

// Sinhala and Tamil letters are unreadable at the tiny label sizes used for
// English, so in those languages every tiny label gets one readable size.
// (A plain style tag: styled-jsx drops these escaped class names.)
const SMALL_TEXT_BY_LANGUAGE_CSS = `
[data-site-language="sinhala"] .text-\\[6px\\],
[data-site-language="sinhala"] .sm\\:text-\\[6px\\],
[data-site-language="sinhala"] .text-\\[7px\\],
[data-site-language="sinhala"] .sm\\:text-\\[7px\\],
[data-site-language="sinhala"] .text-\\[8px\\],
[data-site-language="sinhala"] .sm\\:text-\\[8px\\],
[data-site-language="sinhala"] .text-\\[9px\\],
[data-site-language="sinhala"] .sm\\:text-\\[9px\\],
[data-site-language="tamil"] .text-\\[6px\\],
[data-site-language="tamil"] .sm\\:text-\\[6px\\],
[data-site-language="tamil"] .text-\\[7px\\],
[data-site-language="tamil"] .sm\\:text-\\[7px\\],
[data-site-language="tamil"] .text-\\[8px\\],
[data-site-language="tamil"] .sm\\:text-\\[8px\\],
[data-site-language="tamil"] .text-\\[9px\\],
[data-site-language="tamil"] .sm\\:text-\\[9px\\] {
  font-size: 11px !important;
  letter-spacing: 0.02em !important;
}

[data-site-language="sinhala"] .text-\\[10px\\],
[data-site-language="sinhala"] .sm\\:text-\\[10px\\],
[data-site-language="tamil"] .text-\\[10px\\],
[data-site-language="tamil"] .sm\\:text-\\[10px\\] {
  font-size: 12px !important;
}
`;

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/ZeroFMRadio",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/@ZeroFMlive",
};

type IconName =
  | "search"
  | "radio"
  | "music"
  | "community"
  | "mobile"
  | "pin"
  | "arrow"
  | "facebook"
  | "instagram"
  | "youtube";

function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const shapes: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </>
    ),

    radio: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="m7 6 10-3M7 11h.01M11 11h.01M15 11h.01M7 16h10" />
      </>
    ),

    music: (
      <>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </>
    ),

    community: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),

    mobile: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M11 18h2" />
      </>
    ),

    pin: (
      <>
        <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),

    arrow: (
      <>
        <path d="M7 17 17 7M7 7h10v10" />
      </>
    ),

    facebook: (
      <path
        fill="currentColor"
        stroke="none"
        d="M13.5 8H16V4h-2.5C10.4 4 9 5.6 9 8.5V11H6v4h3v5h4v-5h3l.5-4H13v-2.2c0-.6.2-.8.5-.8Z"
      />
    ),

    instagram: (
      <>
        <rect
          x="3.5"
          y="3.5"
          width="17"
          height="17"
          rx="5"
        />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.4"
          cy="6.7"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),

    youtube: (
      <path
        fill="currentColor"
        stroke="none"
        d="M21.6 7.1a2.8 2.8 0 0 0-2-2C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2C2 8.9 2 12 2 12s0 3.1.4 4.9a2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2c.4-1.8.4-4.9.4-4.9s0-3.1-.4-4.9ZM10 15.8V8.2l6.5 3.8L10 15.8Z"
      />
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes[name]}
    </svg>
  );
}

function SocialLinks() {
  return (
    <div
      className="flex items-center gap-2"
      aria-label="Social links"
    >
      <a
        href={SOCIAL_LINKS.facebook}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zero FM on Facebook"
        title="Facebook"
        className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#121826] text-[#94A3B8] transition hover:border-[#FFD400]/40 hover:text-[#FFD400]"
      >
        <Icon
          name="facebook"
          className="size-3.5"
        />
      </a>

      <a
        href={SOCIAL_LINKS.instagram}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zero FM on Instagram"
        title="Instagram"
        className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#121826] text-[#94A3B8] transition hover:border-[#FFD400]/40 hover:text-[#FFD400]"
      >
        <Icon
          name="instagram"
          className="size-3.5"
        />
      </a>

      <a
        href={SOCIAL_LINKS.youtube}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zero FM on YouTube"
        title="YouTube"
        className="flex size-8 items-center justify-center rounded-full border border-white/[0.08] bg-[#121826] text-[#94A3B8] transition hover:border-[#FFD400]/40 hover:text-[#FFD400]"
      >
        <Icon
          name="youtube"
          className="size-3.5"
        />
      </a>
    </div>
  );
}

const SINHALA_CONSONANTS: Record<string, string> = {
  "ක": "k",
  "ඛ": "kh",
  "ග": "g",
  "ඝ": "gh",
  "ඞ": "ng",
  "ඟ": "ng",
  "ච": "ch",
  "ඡ": "ch",
  "ජ": "j",
  "ඣ": "jh",
  "ඤ": "ny",
  "ඥ": "gn",
  "ට": "t",
  "ඨ": "th",
  "ඩ": "d",
  "ඪ": "dh",
  "ණ": "n",
  "ත": "t",
  "ථ": "th",
  "ද": "d",
  "ධ": "dh",
  "න": "n",
  "ප": "p",
  "ඵ": "ph",
  "බ": "b",
  "භ": "bh",
  "ම": "m",
  "ය": "y",
  "ර": "r",
  "ල": "l",
  "ව": "w",
  "ශ": "sh",
  "ෂ": "sh",
  "ස": "s",
  "හ": "h",
  "ළ": "l",
  "ෆ": "f",
};

const SINHALA_INDEPENDENT_VOWELS: Record<string, string> = {
  "අ": "a",
  "ආ": "a",
  "ඇ": "a",
  "ඈ": "a",
  "ඉ": "i",
  "ඊ": "i",
  "උ": "u",
  "ඌ": "u",
  "ඍ": "ri",
  "ඎ": "ri",
  "එ": "e",
  "ඒ": "e",
  "ඓ": "ai",
  "ඔ": "o",
  "ඕ": "o",
  "ඖ": "au",
};

const SINHALA_VOWEL_SIGNS: Record<string, string> = {
  "ා": "a",
  "ැ": "a",
  "ෑ": "a",
  "ි": "i",
  "ී": "i",
  "ු": "u",
  "ූ": "u",
  "ෘ": "ru",
  "ෲ": "ru",
  "ෙ": "e",
  "ේ": "e",
  "ෛ": "ai",
  "ො": "o",
  "ෝ": "o",
  "ෞ": "au",
};

const SINHALA_SPECIAL: Record<string, string> = {
  "ං": "ng",
  "ඃ": "h",
  "්": "",
};

function transliterateSinhala(value: string): string {
  let result = "";
  const chars = Array.from(value);

  for (let i = 0; i < chars.length; i += 1) {
    const char = chars[i];

    if (SINHALA_CONSONANTS[char]) {
      let syllable = SINHALA_CONSONANTS[char];
      const next = chars[i + 1];

      if (
        next &&
        SINHALA_VOWEL_SIGNS[next] !== undefined
      ) {
        syllable += SINHALA_VOWEL_SIGNS[next];
        i += 1;
      } else if (next === "්") {
        i += 1;
      } else {
        syllable += "a";
      }

      result += syllable;
      continue;
    }

    if (SINHALA_INDEPENDENT_VOWELS[char]) {
      result += SINHALA_INDEPENDENT_VOWELS[char];
      continue;
    }

    if (SINHALA_SPECIAL[char] !== undefined) {
      result += SINHALA_SPECIAL[char];
      continue;
    }

    result += char;
  }

  return result;
}

function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’'`"]/g, "")
    .replace(/[_\-./\\()[\]{}:;,!?|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactSearchText(value: string): string {
  return normalizeSearchText(value).replace(/\s+/g, "");
}

const SINGLISH_ALIASES: Record<string, string> = {
  mn: "mama",
  m: "mama",
  mge: "mage",
  oya: "oya",
  oyata: "oyata",
  katha: "katha",
  karanawa: "karanawa",
  krnawa: "karanawa",
  wage: "wage",
  wagee: "wage",
  hithe: "hithe",
  hite: "hithe",
  mage: "mage",
};

function normalizeSinglish(value: string): string {
  return normalizeSearchText(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => SINGLISH_ALIASES[word] || word)
    .map((word) =>
      word
        .replace(/aa/g, "a")
        .replace(/ee/g, "i")
        .replace(/ii/g, "i")
        .replace(/oo/g, "o")
        .replace(/uu/g, "u")
    )
    .join(" ");
}

function levenshteinDistance(
  a: string,
  b: string
): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const previous = Array.from(
    { length: b.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= a.length; i += 1) {
    let current = i;

    for (let j = 1; j <= b.length; j += 1) {
      const insert = previous[j] + 1;
      const remove = current + 1;

      const replace =
        previous[j - 1] +
        (a[i - 1] === b[j - 1] ? 0 : 1);

      current = Math.min(
        insert,
        remove,
        replace
      );

      previous[j - 1] = current;
    }

    previous[b.length] = current;
  }

  return previous[b.length];
}

function isCloseEnough(
  query: string,
  word: string
): boolean {
  if (!query || !word) return false;

  if (
    word.includes(query) ||
    query.includes(word)
  ) {
    return true;
  }

  const maxDistance =
    query.length <= 4
      ? 1
      : query.length <= 7
        ? 2
        : 3;

  return (
    levenshteinDistance(
      query,
      word
    ) <= maxDistance
  );
}
function getSearchScore(
  song: {
    title: string;
    artist: string;
  },
  query: string
): number {
  const originalTitle =
    normalizeSearchText(song.title || "");

  const originalArtist =
    normalizeSearchText(song.artist || "");

  const transliteratedTitle =
    normalizeSearchText(
      transliterateSinhala(song.title || "")
    );

  const transliteratedArtist =
    normalizeSearchText(
      transliterateSinhala(song.artist || "")
    );

  const titleCompact =
    compactSearchText(song.title || "");

  const artistCompact =
    compactSearchText(song.artist || "");

  const transliteratedTitleCompact =
    compactSearchText(
      transliterateSinhala(song.title || "")
    );

  const transliteratedArtistCompact =
    compactSearchText(
      transliterateSinhala(song.artist || "")
    );

  const normalizedQuery =
    normalizeSearchText(query);

  const compactQuery =
    compactSearchText(query);

  const singlishQuery =
    normalizeSinglish(query);

  const singlishTitle =
    normalizeSinglish(transliteratedTitle);

  const singlishArtist =
    normalizeSinglish(transliteratedArtist);

  if (!normalizedQuery) {
    return 0;
  }

  if (
    originalTitle === normalizedQuery
  ) {
    return 1000;
  }

  if (
    transliteratedTitle === normalizedQuery
  ) {
    return 980;
  }

  if (
    singlishTitle === singlishQuery
  ) {
    return 975;
  }

  if (
    singlishTitle.includes(singlishQuery)
  ) {
    return 835;
  }

  if (
    originalArtist === normalizedQuery
  ) {
    return 900;
  }

  if (
    transliteratedArtist === normalizedQuery
  ) {
    return 880;
  }

  if (
    originalTitle.includes(
      normalizedQuery
    )
  ) {
    return 850;
  }

  if (
    transliteratedTitle.includes(
      normalizedQuery
    )
  ) {
    return 840;
  }

  if (
    titleCompact.includes(
      compactQuery
    )
  ) {
    return 830;
  }

  if (
    transliteratedTitleCompact.includes(
      compactQuery
    )
  ) {
    return 820;
  }

  if (
    originalArtist.includes(
      normalizedQuery
    )
  ) {
    return 760;
  }

  if (
    transliteratedArtist.includes(
      normalizedQuery
    )
  ) {
    return 750;
  }

  if (
    artistCompact.includes(
      compactQuery
    )
  ) {
    return 740;
  }

  if (
    transliteratedArtistCompact.includes(
      compactQuery
    )
  ) {
    return 730;
  }

  const queryWords = Array.from(
    new Set([
      ...normalizedQuery
        .split(" ")
        .filter(Boolean),

      ...singlishQuery
        .split(" ")
        .filter(Boolean),
    ])
  );

  const titleWords = [
    ...originalTitle.split(" "),
    ...transliteratedTitle.split(" "),
    ...singlishTitle.split(" "),
  ].filter(Boolean);

  const artistWords = [
    ...originalArtist.split(" "),
    ...transliteratedArtist.split(" "),
    ...singlishArtist.split(" "),
  ].filter(Boolean);

  let titleMatches = 0;
  let artistMatches = 0;

  for (const queryWord of queryWords) {
    if (
      titleWords.some((word) =>
        isCloseEnough(
          queryWord,
          word
        )
      )
    ) {
      titleMatches += 1;
    }

    if (
      artistWords.some((word) =>
        isCloseEnough(
          queryWord,
          word
        )
      )
    ) {
      artistMatches += 1;
    }
  }

  if (
    queryWords.length > 0 &&
    titleMatches === queryWords.length
  ) {
    return 700 + titleMatches * 10;
  }

  if (
    queryWords.length > 0 &&
    artistMatches === queryWords.length
  ) {
    return 600 + artistMatches * 10;
  }

  if (titleMatches > 0) {
    return 400 + titleMatches * 10;
  }

  if (artistMatches > 0) {
    return 300 + artistMatches * 10;
  }

  return 0;
}

type SearchSong = {
  id: number;
  artist: string;
  title: string;
  artwork?: {
    url?: string | null;
    large_url?: string | null;
  } | null;
};

type HomeTrackData = {
  title?: string;
  track_title?: string;
  track_artist?: string;
  artist?: string;
  artwork_urls?: {
    standard?: string;
    large?: string;
  };
};

type HomeNowPlayingResponse = {
  data?: HomeTrackData;
};

type SiteLanguage =
  | "english"
  | "sinhala"
  | "tamil";

type TranslationKey =
  | "home"
  | "live"
  | "programs"
  | "request"
  | "about"
  | "contact"
  | "downloadApp"
  | "musicConnects"
  | "goodMusic"
  | "brighterDays"
  | "digitalCommunity"
  | "listenLive"
  | "contactStudio"
  | "anytimeAnywhere"
  | "onAirNow"
  | "feelGoodVibes"
  | "liveNow"
  | "nationwideDigitalStream"
  | "searchSongsArtists"
  | "clear"
  | "searchZeroSongs"
  | "englishSinhalaSinglish"
  | "loadingSongs"
  | "result"
  | "results"
  | "noSongsFound"
  | "tryAnotherSpelling"
  | "liveRadioStreaming"
  | "requestSongs"
  | "viewProgramSchedule"
  | "worksOnTheGo"
  | "joinOurCommunity"
  | "sameGreatMusic"
  | "moreFreedom"
  | "connectWithZero"
  | "joinCommunity"
  | "platform"
  | "liveStream"
  | "requestSong"
  | "todaysSchedule"
  | "explore"
  | "company"
  | "aboutZero"
  | "pressMedia"
  | "supportConnect"
  | "contactStudioBooth"
  | "helpFaq"
  | "privacy"
  | "terms"
  | "broadcasting"
  | "transmitting"
  | "colomboStream"
  | "searchExample"
  | "singlishHint";

const SITE_TRANSLATIONS: Record<
  SiteLanguage,
  Record<TranslationKey, string>
> = {
  english: {
    home: "Home",
    live: "Live",
    programs: "Programs",
    request: "Request",
    about: "About",
    contact: "Contact",
    downloadApp: "Download App",
    musicConnects: "Music Connects Us",
    goodMusic: "Good Music",
    brighterDays: "Brighter Days",
    digitalCommunity:
      "Sri Lanka's Digital Music Community",
    listenLive: "Listen Live",
    contactStudio: "Contact Studio",
    anytimeAnywhere:
      "Anytime • Anywhere • For Everyone",
    onAirNow: "On Air Now",
    feelGoodVibes: "Feel the Good Vibes",
    liveNow: "Live now",
    nationwideDigitalStream:
      "Nationwide Digital Stream",
    searchSongsArtists:
      "Search songs or artists...",
    clear: "Clear",
    searchZeroSongs:
      "Search Zero FM songs",
    englishSinhalaSinglish:
      "English, Sinhala or Singlish",
    loadingSongs: "Loading songs...",
    result: "result",
    results: "results",
    noSongsFound: "No songs found",
    tryAnotherSpelling:
      "Try another spelling or search using the artist name.",
    liveRadioStreaming:
      "Live Radio Streaming",
    requestSongs: "Request Songs",
    viewProgramSchedule:
      "View Program Schedule",
    worksOnTheGo: "Works on the Go",
    joinOurCommunity:
      "Join Our Community",
    sameGreatMusic: "Same Great Music",
    moreFreedom: "More Freedom",
    connectWithZero:
      "CONNECT WITH ZERO",
    joinCommunity:
      "Join our community and stay in tune.",
    platform: "Platform",
    liveStream: "Live Stream",
    requestSong: "Request Song",
    todaysSchedule: "Today's Schedule",
    explore: "Explore",
    company: "Company",
    aboutZero: "About Zero FM",
    pressMedia: "Press & Media",
    supportConnect:
      "Support & Connect",
    contactStudioBooth:
      "Contact Studio Booth",
    helpFaq: "Help Center & FAQs",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    broadcasting:
      "Broadcasting progressive electronic, alternative club sounds and curated underground frequencies.",
    transmitting:
      "Transmitting 24/7 Digital Audio",
    colomboStream:
      "Colombo 104.2 FM • Nationwide Digital Stream",
    searchExample:
      "Example: manike, mage hithe, yohani",
    singlishHint:
      "Singlish typing is supported",
  },

  sinhala: {
    home: "මුල් පිටුව",
    live: "සජීවී",
    programs: "වැඩසටහන්",
    request: "ගීත ඉල්ලීම",
    about: "අප ගැන",
    contact: "අමතන්න",
    downloadApp: "යෙදුම බාගන්න",
    musicConnects:
      "සංගීතය අපව සම්බන්ධ කරයි",
    goodMusic: "හොඳ සංගීතය.",
    brighterDays: "දීප්තිමත් දවස්.",
    digitalCommunity:
      "ශ්‍රී ලංකාවේ ඩිජිටල් සංගීත ප්‍රජාව",
    listenLive: "සජීවීව අසන්න",
    contactStudio:
      "ස්ටුඩියෝව අමතන්න",
    anytimeAnywhere:
      "ඕනෑම වේලාවක • ඕනෑම තැනක • හැමෝටම",
    onAirNow: "දැන් විකාශය වේ",
    feelGoodVibes:
      "හොඳ සංගීත රසය විඳින්න",
    liveNow: "දැන් සජීවීව",
    nationwideDigitalStream:
      "දිවයින පුරා ඩිජිටල් ප්‍රවාහය",
    searchSongsArtists:
      "ගීත හෝ ගායකයන් සොයන්න...",
    clear: "මකන්න",
    searchZeroSongs:
      "Zero FM ගීත සොයන්න",
    englishSinhalaSinglish:
      "ඉංග්‍රීසි, සිංහල හෝ Singlish",
    loadingSongs:
      "ගීත පූරණය වෙමින්...",
    result: "ප්‍රතිඵලය",
    results: "ප්‍රතිඵල",
    noSongsFound:
      "ගීත හමු නොවීය",
    tryAnotherSpelling:
      "වෙනත් අක්ෂර වින්‍යාසයක් හෝ ගායකයාගේ නම භාවිතා කර බලන්න.",
    liveRadioStreaming:
      "සජීවී ගුවන්විදුලි ප්‍රවාහය",
    requestSongs:
      "ගීත ඉල්ලන්න",
    viewProgramSchedule:
      "වැඩසටහන් කාලසටහන බලන්න",
    worksOnTheGo:
      "ගමන් කරන අතරතුරත්",
    joinOurCommunity:
      "අපේ ප්‍රජාවට එක්වන්න",
    sameGreatMusic:
      "එකම විශිෂ්ට සංගීතය",
    moreFreedom:
      "වැඩි නිදහසක්",
    connectWithZero:
      "ZERO සමඟ සම්බන්ධ වන්න",
    joinCommunity:
      "අපේ ප්‍රජාවට එක්වී සංගීතය සමඟ රැඳී සිටින්න.",
    platform: "වේදිකාව",
    liveStream:
      "සජීවී ප්‍රවාහය",
    requestSong:
      "ගීතයක් ඉල්ලන්න",
    todaysSchedule:
      "අද වැඩසටහන්",
    explore:
      "ගවේෂණය",
    company:
      "ආයතනය",
    aboutZero:
      "Zero FM ගැන",
    pressMedia:
      "මාධ්‍ය සහ ප්‍රචාරණ",
    supportConnect:
      "සහාය සහ සම්බන්ධතා",
    contactStudioBooth:
      "ස්ටුඩියෝව අමතන්න",
    helpFaq:
      "උදව් සහ නිතර අසන ප්‍රශ්න",
    privacy:
      "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
    terms:
      "නියම සහ කොන්දේසි",
    broadcasting:
      "ප්‍රගතිශීලී ඉලෙක්ට්‍රොනික, විකල්ප ක්ලබ් සංගීත සහ තෝරාගත් භූගත ශබ්ද රැසක් විකාශය කරයි.",
    transmitting:
      "පැය 24 පුරා සතියේ දින 7ම ඩිජිටල් ශ්‍රව්‍ය විකාශය වේ",
    colomboStream:
      "කොළඹ 104.2 FM • දිවයින පුරා ඩිජිටල් ප්‍රවාහය",
    searchExample:
      "උදාහරණය: manike, mage hithe, yohani",
    singlishHint:
      "Singlish ලෙස ටයිප් කිරීමත් සහාය වේ",
  },

  tamil: {
    home: "முகப்பு",
    live: "நேரலை",
    programs: "நிகழ்ச்சிகள்",
    request: "பாடல் கோரிக்கை",
    about: "எங்களைப் பற்றி",
    contact: "தொடர்பு",
    downloadApp:
      "செயலியைப் பதிவிறக்கவும்",
    musicConnects:
      "இசை நம்மை இணைக்கிறது",
    goodMusic: "நல்ல இசை.",
    brighterDays:
      "பிரகாசமான நாட்கள்.",
    digitalCommunity:
      "இலங்கையின் டிஜிட்டல் இசை சமூகம்",
    listenLive:
      "நேரலையாக கேளுங்கள்",
    contactStudio:
      "ஸ்டுடியோவைத் தொடர்பு கொள்ளுங்கள்",
    anytimeAnywhere:
      "எப்போது வேண்டுமானாலும் • எங்கு வேண்டுமானாலும் • அனைவருக்கும்",
    onAirNow:
      "தற்போது ஒலிபரப்பு",
    feelGoodVibes:
      "நல்ல இசை உணர்வுகளை அனுபவிக்கவும்",
    liveNow:
      "இப்போது நேரலை",
    nationwideDigitalStream:
      "நாடு முழுவதும் டிஜிட்டல் ஒளிபரப்பு",
    searchSongsArtists:
      "பாடல்கள் அல்லது கலைஞர்களைத் தேடுங்கள்...",
    clear: "அழிக்க",
    searchZeroSongs:
      "Zero FM பாடல்களைத் தேடுங்கள்",
    englishSinhalaSinglish:
      "ஆங்கிலம், சிங்களம் அல்லது Singlish",
    loadingSongs:
      "பாடல்கள் ஏற்றப்படுகின்றன...",
    result: "முடிவு",
    results: "முடிவுகள்",
    noSongsFound:
      "பாடல்கள் எதுவும் கிடைக்கவில்லை",
    tryAnotherSpelling:
      "வேறு எழுத்துப்பிழையுடன் அல்லது கலைஞரின் பெயருடன் தேடிப் பாருங்கள்.",
    liveRadioStreaming:
      "நேரலை வானொலி ஒளிபரப்பு",
    requestSongs:
      "பாடல்களைக் கோருங்கள்",
    viewProgramSchedule:
      "நிகழ்ச்சி அட்டவணையைப் பார்க்கவும்",
    worksOnTheGo:
      "பயணத்திலும் இயங்கும்",
    joinOurCommunity:
      "எங்கள் சமூகத்தில் இணையுங்கள்",
    sameGreatMusic:
      "அதே சிறந்த இசை",
    moreFreedom:
      "மேலும் சுதந்திரம்",
    connectWithZero:
      "ZERO உடன் இணையுங்கள்",
    joinCommunity:
      "எங்கள் சமூகத்தில் இணைந்து இசையுடன் தொடர்ந்து இருங்கள்.",
    platform: "தளம்",
    liveStream:
      "நேரலை ஒளிபரப்பு",
    requestSong:
      "பாடலைக் கோருங்கள்",
    todaysSchedule:
      "இன்றைய அட்டவணை",
    explore:
      "ஆராயுங்கள்",
    company:
      "நிறுவனம்",
    aboutZero:
      "Zero FM பற்றி",
    pressMedia:
      "பத்திரிகை மற்றும் ஊடகம்",
    supportConnect:
      "ஆதரவு மற்றும் தொடர்பு",
    contactStudioBooth:
      "ஸ்டுடியோவைத் தொடர்பு கொள்ளுங்கள்",
    helpFaq:
      "உதவி மற்றும் கேள்விகள்",
    privacy:
      "தனியுரிமைக் கொள்கை",
    terms:
      "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
    broadcasting:
      "முன்னேற்றமான எலக்ட்ரானிக், மாற்று கிளப் இசை மற்றும் தேர்ந்தெடுக்கப்பட்ட அண்டர்கிரவுண்ட் ஒலிகளை ஒலிபரப்புகிறது.",
    transmitting:
      "24/7 டிஜிட்டல் ஆடியோ ஒலிபரப்பு",
    colomboStream:
      "கொழும்பு 104.2 FM • நாடு முழுவதும் டிஜிட்டல் ஒளிபரப்பு",
    searchExample:
      "உதாரணம்: manike, mage hithe, yohani",
    singlishHint:
      "Singlish தட்டச்சும் ஆதரிக்கப்படுகிறது",
  },
};
/*
 * Search icon popup: the same song list as Explore, with every song and
 * language filters. Picking a song sends it to the Radio.co queue through
 * /api/queue, exactly like Explore and the request form.
 */
function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  if (!open) return null;

  return (
    <CategoryModal
      category={{
        title: t("requestWidget.title"),
        language: "all",
      }}
      onClose={onClose}
    />
  );
}

const communityCards = (
  language: SiteLanguage
) => [
  {
    image:
      "/images/Electric Night Festival Crowd.png",
    label: "#ZeroFM",
  },
  {
    image:
      "/images/Neon Night DJ Booth.png",
    lines:
      language === "sinhala"
        ? [
            "සංගීතය",
            "මිනිසුන්",
            "ප්‍රජාව",
          ]
        : language === "tamil"
          ? [
              "இசை",
              "மக்கள்",
              "சமூகம்",
            ]
          : [
              "MUSIC",
              "PEOPLE",
              "COMMUNITY",
            ],
  },
  {
    image:
      "/images/Tropical Palm Beach Sunset.png",
    lines:
      language === "sinhala"
        ? [
            "හොඳ",
            "සංගීතය",
            "දීප්තිමත්",
            "දවස්",
          ]
        : language === "tamil"
          ? [
              "நல்ல",
              "இசை",
              "பிரகாசமான",
              "நாட்கள்",
            ]
          : [
              "Good",
              "Music",
              "Brighter",
              "Days",
            ],
  },
];

export default function ZeroFMHome() {
  const [searchOpen, setSearchOpen] =
    React.useState(false);

  const closeSearch = React.useCallback(
    () => setSearchOpen(false),
    []
  );

  // Highlights the navbar link for the section on screen
  const activeNav = useActiveSection();

  // One shared language for the whole page, so every section
  // (player, schedule, request form, explorer) switches together.
  const {
    language: siteLanguage,
    setLanguage: setSiteLanguage,
  } = useLanguage();

  const [homeTrack, setHomeTrack] =
    React.useState<HomeTrackData | null>(
      null
    );

  const t = (key: TranslationKey) =>
    SITE_TRANSLATIONS[
      siteLanguage
    ][key];

  React.useEffect(() => {
    let cancelled = false;

    const fetchHomeNowPlaying = async () => {
      try {
        const result =
          await fetchNowPlaying<HomeNowPlayingResponse>();

        if (!cancelled) {
          setHomeTrack(result.data ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to fetch home now playing:",
            error
          );
        }
      }
    };

    void fetchHomeNowPlaying();

    const interval = window.setInterval(
      () => {
        void fetchHomeNowPlaying();
      },
      NOW_PLAYING_POLL_MS
    );

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  // Sinhala and Tamil words are much wider than English at the same size,
  // so the big hero text gets smaller sizes and is allowed to wrap
  const wideScript = siteLanguage !== "english";

  return (
    <main
      lang={
        siteLanguage === "sinhala"
          ? "si"
          : siteLanguage === "tamil"
            ? "ta"
            : "en"
      }
      data-site-language={
        siteLanguage
      }
      className="min-h-screen overflow-hidden bg-[#090D16] pt-[72px] text-white"
    >
      <style jsx global>{`
        [data-site-language="sinhala"] .font-display,
        [data-site-language="sinhala"] .font-body,
        [data-site-language="sinhala"] .font-mono {
          font-family: "Noto Sans Sinhala",
            "Noto Sans", sans-serif !important;
        }

        .footer-links a {
          width: fit-content;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #ffd400;
        }

        [data-site-language="tamil"] .font-display,
        [data-site-language="tamil"] .font-body,
        [data-site-language="tamil"] .font-mono {
          font-family: "Noto Sans Tamil",
            "Noto Sans", sans-serif !important;
        }
      `}</style>

      <style
        dangerouslySetInnerHTML={{
          __html: SMALL_TEXT_BY_LANGUAGE_CSS,
        }}
      />

      <PageEffects />

      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
      />

      <header className="fixed left-0 right-0 top-0 z-[100] h-[72px] w-full border-b border-white/[0.08] bg-[#0A0E17]">
        <div className="mx-auto flex h-full max-w-[1440px] items-center gap-4 px-5 sm:px-8 lg:px-12">
          <a
            href="#home"
            aria-label="Zero FM home"
            className="flex shrink-0 items-center"
          >
            <img
              src={
                ZERO_FM_NAV_FOOTER_LOGO
              }
              alt="Zero FM Live"
              className="h-auto w-[148px] object-contain object-left"
            />
          </a>

<nav
  className="font-body ml-auto hidden items-center gap-6 xl:flex"
  aria-label="Main navigation"
>
  {[
    ["home", "#home"],
    ["live", "#live"],
    ["programs", "#programs"],
    ["request", "#request"],
    ["about", "#about"],
    ["contact", "#contact"],
  ].map(([label, href]) => {
    const isActive =
      activeNav === label;

    return (
      <a
        key={label}
        href={href}
        onClick={() =>
          selectSection(label)
        }
        aria-current={
          isActive ? "true" : undefined
        }
        className={`relative py-2 text-[12px] transition hover:text-[#FFD400] ${
          isActive
            ? "text-white"
            : "text-[#94A3B8]"
        }`}
      >
        {t(
          label as TranslationKey
        )}

        <span
          className={`absolute inset-x-0 -bottom-[11px] h-0.5 origin-center bg-[#FFD400] transition-transform duration-300 ${
            isActive
              ? "scale-x-100"
              : "scale-x-0"
          }`}
        />
      </a>
    );
  })}
</nav>
          <div className="ml-auto hidden items-center gap-3 xl:flex">
            <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Zero FM"
                title="Search"
                className="flex size-8 items-center justify-center rounded-full text-[#94A3B8] transition hover:bg-white/[0.05] hover:text-[#FFD400]"
                >
                <Icon
                    name="search"
                    className="size-4"
                />
                </button>

            <SocialLinks />

            <a
              href="#app"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#FFD400] px-4 text-[10px] font-bold text-[#090D16] transition hover:bg-[#ffe45c]"
            >
              <Icon
                name="mobile"
                className="size-3.5"
              />

              {t("downloadApp")}
            </a>
          </div>

          <div className="ml-auto xl:hidden">
            <MobileMenu />
          </div>
        </div>
      </header>
            {/* =========================================================
    HERO SECTION — FIGMA BACKGROUND
    Adds the deep navy gradient and subtle yellow circles.
    ========================================================= */}
<section
  id="home"
  className="relative isolate scroll-mt-[72px] overflow-hidden border-b border-white/[0.07] bg-[#0A0F1A]"
>
  {/* Background gradient */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 -z-10"
    style={{
      background:
        "linear-gradient(180deg, #0A0F1A 0%, #0D1424 50%, #080C14 100%)",
    }}
  />

  {/* Decorative circle — upper left */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -left-[190px] -top-[130px] -z-10 h-[500px] w-[800px] rounded-full border border-[#FFD400]/20"
    style={{
      boxShadow: "0 0 16px rgba(255, 212, 0, 0.08)",
    }}
  />

  {/* Decorative circle — upper right */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute -right-[40px] -top-[100px] -z-10 h-[700px] w-[700px] rounded-full border border-[#FFD400]/20"
    style={{
      boxShadow: "0 0 16px rgba(255, 212, 0, 0.08)",
    }}
  />

  {/* Decorative circle — lower section */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute left-[25%] top-[320px] -z-10 h-[450px] w-[1012px] rounded-full border border-[#FFD400]/15"
  />

  {/* Keep the existing hero content below this point */}
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-8 px-6 py-10 sm:px-8 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8 lg:px-6 lg:py-14">
          <div className="relative z-10 min-w-0">
            

            {/* =========================================================
    HERO TITLE — SPACE GROTESK + HANDWRITTEN FONT
    ========================================================= */}
<h1
  className={`m-0 font-bold text-white ${
    wideScript
      ? "text-[40px] leading-[1.15] sm:text-[52px] lg:text-[58px]"
      : "text-[52px] leading-[0.9] tracking-[-0.045em] min-[400px]:text-[64px] sm:text-[70px] lg:text-[76px]"
  }`}
  style={{
    fontFamily: '"Space Grotesk", sans-serif',
  }}
>
  {/* Main white heading */}
  <span className="block">
    {t("goodMusic")}
  </span>

  {/* Yellow handwritten heading */}
  <span
    className={`mt-1 block max-w-full -rotate-2 pb-3 font-normal tracking-normal sm:pb-4 ${
      wideScript
        ? "w-fit text-[40px] leading-[1.2] sm:text-[52px] lg:text-[62px]"
        : "w-fit whitespace-nowrap text-[56px] leading-[1] min-[400px]:text-[68px] sm:text-[82px] lg:text-[96px]"
    }`}
    style={{
      fontFamily: '"Covered By Your Grace", cursive',
      color: "#FFD400",
      textShadow: "0 4px 12px rgba(255, 212, 0, 0.20)",
    }}
  >
    {t("brighterDays")}
  </span>
</h1>

            <p className="mt-4 font-mono text-[8px] font-medium uppercase tracking-[0.19em] text-[#94A3B8] sm:text-[9px]">
              {t("digitalCommunity")}
            </p>

            <div className="font-body mt-5 flex w-fit gap-1 rounded-full border border-white/[0.08] bg-[#0F1523] p-1 text-[8px] uppercase tracking-[0.07em]">
              <button
                type="button"
                onClick={() =>
                  setSiteLanguage(
                    "sinhala"
                  )
                }
                className={`rounded-full px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/60 ${
                  siteLanguage ===
                  "sinhala"
                    ? "bg-[#FFD400]/10 font-bold text-[#FFD400]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                සිංහල
              </button>

              <button
                type="button"
                onClick={() =>
                  setSiteLanguage(
                    "tamil"
                  )
                }
                className={`rounded-full px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/60 ${
                  siteLanguage === "tamil"
                    ? "bg-[#FFD400]/10 font-bold text-[#FFD400]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                தமிழ்
              </button>

              <button
                type="button"
                onClick={() =>
                  setSiteLanguage(
                    "english"
                  )
                }
                className={`rounded-full px-2 py-1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD400]/60 ${
                  siteLanguage ===
                  "english"
                    ? "bg-[#FFD400]/10 font-bold text-[#FFD400]"
                    : "text-[#94A3B8] hover:text-white"
                }`}
              >
                English
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href="#live"
                onClick={(event) => {
                  // Scroll to the player and start the stream
                  event.preventDefault();
                  requestPlay();
                }}
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-[#FFD400] px-5 text-[10px] font-bold uppercase tracking-[0.06em] text-[#090D16] shadow-[0_0_0_rgba(255,212,0,0)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffe45c] hover:shadow-[0_12px_30px_rgba(255,212,0,0.25)]"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-[#090D16] text-[8px] text-[#FFD400] transition-transform duration-300 group-hover:scale-110">
                  ▶
                </span>

                {t("listenLive")}
              </a>

              {/*<a
                href="#contact"
                className="inline-flex h-11 items-center rounded-full border border-white/15 px-5 text-[10px] font-bold uppercase tracking-[0.06em] text-white/85"
              >
                {t("contactStudio")}
              </a>*/}
            </div>

            <p className="font-body mt-4 text-[7px] uppercase tracking-[0.17em] text-[#64748B]">
              {t(
                "anytimeAnywhere"
              )}
            </p>
          </div>

          <div className="relative min-w-0">
            <div className="relative overflow-visible rounded-[28px] border border-white/[0.10] bg-[#101626]/90 p-3 pt-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] sm:p-4">
              <div className="group/hero relative aspect-[16/10] sm:aspect-[2.18/1] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111622]">
                <img
                  src={
                    ZERO_FM_HERO_PHOTO
                  }
                  alt="Woman enjoying music with headphones"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-out group-hover/hero:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-r from-[#090D16]/80 via-[#090D16]/35 to-transparent" />

                {/* =========================================================
    IMAGE OVERLAY TEXT — FIGMA TYPOGRAPHY
    Small mono label + two handwritten lines.
    ========================================================= */}
<div className="absolute inset-0 flex min-w-0 flex-col items-start justify-center p-5 sm:p-6">
  {/* Small ON AIR NOW label */}
  <p
    className="text-[9px] font-semibold uppercase leading-[13.5px] tracking-[2.16px] text-[#8F9CAE]"
    style={{
      fontFamily: '"JetBrains Mono", monospace',
    }}
  >
    {t("onAirNow")}
  </p>

  {/* White handwritten line */}
  <p
    className={`mt-2 max-w-full font-normal text-white ${
      wideScript
        ? "text-[20px] leading-[1.3] sm:text-[28px] lg:text-[32px]"
        : "text-[36px] leading-[40px]"
    }`}
    style={{
      fontFamily: '"Covered By Your Grace", cursive',
    }}
  >
    {t("feelGoodVibes").split(" ").slice(0, 2).join(" ")}
  </p>

  {/* Yellow handwritten line */}
  <p
    className={`max-w-full font-normal text-[#FFD400] ${
      wideScript
        ? "text-[22px] leading-[1.3] sm:text-[32px] lg:text-[36px]"
        : "-mt-1 text-[42px] leading-[46px] sm:text-[48px] sm:leading-[48px]"
    }`}
    style={{
      fontFamily: '"Covered By Your Grace", cursive',
    }}
  >
    {t("feelGoodVibes").split(" ").slice(2).join(" ")}
  </p>
</div>

                <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#090D16]/75 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-white">
                  <span className="size-1.5 rounded-full bg-[#34D399]" />
                  {t("live")}
                </span>
              </div>


<div className="grid grid-cols-[1fr_auto] items-center gap-3 px-2 py-3 sm:px-3">
  <div className="flex min-w-0 items-center gap-3">
    <div className="size-10 shrink-0 overflow-hidden rounded-lg bg-[#111622]">
      {homeTrack?.artwork_urls?.standard ||
      homeTrack?.artwork_urls?.large ? (
        <img
          src={
            homeTrack.artwork_urls.standard ||
            homeTrack.artwork_urls.large ||
            ""
          }
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <img
          src={ZERO_FM_LOGO}
          alt="Zero FM"
          className="size-full object-contain p-1"
        />
      )}
    </div>

    <div className="min-w-0">
        <p className="flex items-center gap-2 font-mono text-[7px] uppercase tracking-[0.1em] text-[#34D399]">
            <span className="size-1.5 shrink-0 rounded-full bg-[#34D399]" />
            {t("liveNow")}
        </p>

        <p className="truncate font-display text-[10px] font-semibold text-white sm:text-xs">
            {homeTrack?.track_title ||
            homeTrack?.title ||
            "Zero FM Live"}
        </p>

        <p className="truncate font-mono text-[9px] text-[#8F9CAE]">
            {homeTrack?.track_artist ||
            homeTrack?.artist ||
            "Zero FM"}
        </p>
    </div>
</div>

  <a
    href="#live"
    aria-label="Open live player"
    onClick={(event) => {
      event.preventDefault();
      requestPlay();
    }}
    className="flex size-9 items-center justify-center rounded-full bg-[#FFD400] text-[11px] text-[#090D16] transition duration-300 hover:scale-110 hover:bg-[#FFE45C] hover:shadow-[0_0_20px_rgba(255,212,0,0.35)]"
  >
    ▶
  </a>
</div>



</div>
</div>
</div>

</section>

<RadioPlayer />

      <section
        id="music"
        className="scroll-mt-[72px] border-b border-white/[0.07] bg-[#090D16]"
      >
        <div className="mx-auto grid max-w-[1440px] gap-3 px-5 pt-6 pb-28 sm:px-8 lg:grid-cols-[1fr_0.28fr] lg:px-12 lg:pt-6 lg:pb-32">
          <CategoryExplorer
            language={siteLanguage}
          />

          <aside className="rounded-xl border border-white/[0.08] bg-[#0F1523] p-3">
            <div className="flex flex-col gap-2">
              {[
                {
                  title: "liveRadioStreaming" as const,
                  href: "#live",
                  icon: "radio" as const,
                },
                {
                  title: "requestSongs" as const,
                  href: "#request",
                  icon: "music" as const,
                },
                {
                  title: "viewProgramSchedule" as const,
                  href: "#programs",
                  icon: "pin" as const,
                },
                {
                  title: "worksOnTheGo" as const,
                  href: "#app",
                  icon: "mobile" as const,
                },
                {
                  title: "joinOurCommunity" as const,
                  href: "#about",
                  icon: "community" as const,
                },
              ].map((feature) => (
                <a
                  key={feature.title}
                  href={feature.href}
                  className="group flex items-center gap-3 text-[10px] font-medium text-white/85 transition hover:translate-x-1 hover:text-[#FFD400]"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#121826] text-[#FFD400] transition-colors duration-300 group-hover:bg-[#FFD400] group-hover:text-[#090D16]">
                    <Icon
                      name={feature.icon}
                      className="size-3"
                    />
                  </span>

                  {t(feature.title)}
                </a>
              ))}

</div>

            <p className="mt-3 text-right font-display text-[13px] font-semibold italic leading-tight text-[#FFD400]">
              {t(
                "sameGreatMusic"
              )}
              <br />
              {t(
                "moreFreedom"
              )}
            </p>
          </aside>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-[72px] border-b border-white/[0.07] bg-[#070B13]"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-12 lg:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_2.15fr]">
            <div>
              <h2 className="font-display text-xl font-bold">
                {t(
                  "connectWithZero"
                )}
              </h2>

              <p className="mt-2 text-[9px] leading-5 text-[#8F9CAE]">
                {t(
                  "joinCommunity"
                )}
              </p>

              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
              {communityCards(
                siteLanguage
              ).map(
                (card, index) => (
                  <a
                    href="#contact"
                    key={
                      card.label ||
                      card.lines?.join(
                        "-"
                      )
                    }
                    aria-label={`Zero FM community: ${
                      card.label ||
                      card.lines?.join(
                        " "
                      )
                    }`}
                    className="group relative aspect-[1.42/1] overflow-hidden rounded-lg border border-white/[0.08] bg-[#111622] transition duration-300 hover:-translate-y-1 hover:border-[#FFD400]/35 hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
                  >
                    <img
                      src={card.image}
                      alt="Zero FM listeners enjoying music"
                      className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#070B13]/90 via-transparent to-[#070B13]/10" />

                    <span
                      className={`absolute bottom-2 left-2 right-2 leading-tight text-white sm:bottom-3 sm:left-3 ${
                        index === 2
                          ? "text-center font-display text-[11px] font-semibold italic sm:text-sm"
                          : index === 1
                            ? "font-mono text-[6px] font-semibold uppercase tracking-[0.06em] sm:text-[8px]"
                            : "font-display text-[10px] font-bold sm:text-xs"
                      }`}
                    >
                      {card.label ||
                        card.lines?.map(
                          (line) => (
                            <span
                              key={line}
                              className="block"
                            >
                              {line}
                            </span>
                          )
                        )}
                    </span>
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <RequestSong />

      <footer
        id="contact"
        className="scroll-mt-[72px] bg-[#070B13]"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
          <div className="grid gap-8 border-b border-white/[0.08] pb-7 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.1fr] lg:gap-10">
            <div>
              <a
                href="#home"
                aria-label="Zero FM home"
              >
                <img
                  src={
                    ZERO_FM_NAV_FOOTER_LOGO
                  }
                  alt="Zero FM Live"
                  className="h-auto w-[136px] object-contain object-left"
                />
              </a>

              <p className="mt-3 font-mono text-[7px] font-semibold uppercase tracking-[0.09em] text-[#FFD400]">
                {t(
                  "colomboStream"
                )}
              </p>

              <p className="mt-3 max-w-[340px] text-[9px] leading-5 text-[#8F9CAE]">
                {t(
                  "broadcasting"
                )}
              </p>

              <p className="mt-3 flex items-center gap-2 font-mono text-[7px] uppercase tracking-[0.08em] text-[#34D399]">
                <span className="size-1.5 rounded-full bg-[#34D399]" />

                {t(
                  "transmitting"
                )}
              </p>

              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[8px] font-semibold uppercase tracking-[0.13em] text-white">
                {t("platform")}
              </h3>

              <div className="footer-links mt-3 flex flex-col gap-2.5 text-[9px] text-[#8F9CAE]">
                <a href="#live">
                  {t(
                    "liveStream"
                  )}
                </a>

                <a href="#request">
                  {t(
                    "requestSong"
                  )}
                </a>

                <a href="#programs">
                  {t(
                    "todaysSchedule"
                  )}
                </a>

                <a href="#about">
                  {t("explore")}
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[8px] font-semibold uppercase tracking-[0.13em] text-white">
                {t("company")}
              </h3>

              <div className="footer-links mt-3 flex flex-col gap-2.5 text-[9px] text-[#8F9CAE]">
                <a href="#about">
                  {t(
                    "aboutZero"
                  )}
                </a>

                <a href="#contact">
                  {t(
                    "pressMedia"
                  )}
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-mono text-[8px] font-semibold uppercase tracking-[0.13em] text-white">
                {t(
                  "supportConnect"
                )}
              </h3>

              <div className="footer-links mt-3 flex flex-col gap-2.5 text-[9px] text-[#8F9CAE]">
                <a href="#contact">
                  {t(
                    "contactStudioBooth"
                  )}
                </a>

                {/* Tap to call / open WhatsApp. Update both numbers here. */}
                <a href="tel:+94727170170">
                  Hotline: 072 717 0170
                </a>

                <a
                  href="https://wa.me/94727170170"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp Studio: 072 717 0170
                </a>

                <a href="#contact">
                  {t(
                    "helpFaq"
                  )}
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 font-mono text-[7px] uppercase tracking-[0.08em] text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
            <p>
              ©{" "}
              {new Date().getFullYear()}{" "}
              Zero FM Broadcasting
              Network.{" "}
              {siteLanguage ===
              "sinhala"
                ? "සියලු හිමිකම් ඇවිරිණි."
                : siteLanguage ===
                    "tamil"
                  ? "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
                  : "All rights reserved."}
            </p>

            <div className="footer-links flex gap-5">
              <a href="/privacy-policy">
                {t("privacy")}
              </a>

              <a href="/terms">
                {t("terms")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
