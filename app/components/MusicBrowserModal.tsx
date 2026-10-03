"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "./LanguageContext";


export type SongLanguage = "sinhala" | "tamil" | "english";

type RequestableTrack = {
  id: number;
  title: string;
  artist: string;

  artwork?: {
    url?: string | null;
    large_url?: string | null;
  } | null;

  language?: string | null;
  genre?: string | null;
  category?: string | null;
  categories?: string[] | null;
  genres?: string[] | null;
  tags?: string[] | null;
};

type TracksResponse = {
  data?: RequestableTrack[];
  error?: string;
};

type View = "browse" | "confirm" | "success";

type MusicBrowserModalProps = {
  title: string;
  language: SongLanguage;
  onClose: () => void;
};

const languageLabels: Record<SongLanguage, string> = {
  sinhala: "Sinhala",
  tamil: "Tamil",
  english: "English",
};

/* =========================================================
   SINHALA ARTISTS
   ========================================================= */

const SINHALA_ARTISTS = [
  "mihindu ariyaratne",
  "wayo",
  "santhush",
  "bathiya",
  "bathiya and santhush",
  "umaria",
  "umariya",
  "athma liyanage",
  "gypsies",
  "bachi susan",
  "centigradz",
  "chandimal fernando",
  "kasun kalhara",
  "roshan fernando",
  "dushyanth weeraman",
  "iraj",
  "ranidu",
  "lahiru perera",
  "udara",
  "sashika nisansala",
  "shashika nisansala",
  "shihan mihiranga",
  "sunil edirisinghe",
  "victor ratnayake",
  "amarasiri peiris",
  "clarence wijewardena",
  "milton mallawarachchi",
  "t m jayarathna",
  "t.m. jayarathna",
  "athula adikari",
  "amal perera",
  "namal udugama",
  "chamika sirimanna",
  "damith asanka",
  "roshan ranawana",
  "surendra perera",
  "bns",
  "sanka dineth",
  "dhanith sri",
  "dinesh gamage",
  "manjula pushpakumara",
  "yuki navaratne",
  "sunil perera",
  "jaya sri",
  "chandana liyanarachchi",
  "tirantha walaliyadda",
  "dimanka wellalage",
  "nilan fernando",
  "yohani",
  "yohani diloka de silva",
  "daddy",
  "daddy sri lanka",
  "dimi3",
  "dilki uresha",
  "dilshan weerasuriya",
  "sachith peiris",
  "sachith",
  "supun perera",
  "supun",
  "sajith prematunga",
  "sajith",
  "sashika",
  "sithara madushani",
  "sithara",
  "kaizer kaiz",
  "kaizer",
  "steven rodrigo",
  "rodrigo",
  "baby shanika",
  "baby shanikaa",
  "rajiv sebastian",
  "anton jones",
  "champa kalhari",
  "indrani perera",
  "jayantha rathnayaka",
  "upali kannangara",
  "rohana siriwardana",
  "madumadawa aravinda",
  "noyel raj",
  "helan aththanayake",
  "lakshman hewawitharana",
];

/* =========================================================
   TAMIL ARTISTS
   ========================================================= */

const TAMIL_ARTISTS = [
  "a.r. rahman",
  "a r rahman",
  "ar rahman",
  "anirudh",
  "anirudh ravichander",
  "sid sriram",
  "yuvan shankar raja",
  "yuvan",
  "dhanush",
  "shweta mohan",
  "chinmayi",
  "haricharan",
  "hariharan",
  "srinivas",
  "karthik",
  "vijay yesudas",
  "shankar mahadevan",
  "usha uthup",
  "s. p. balasubrahmanyam",
  "spb",
  "sujatha",
  "madhu balakrishnan",
  "bombay jayashri",
  "tippu",
  "saindhavi",
  "g.v. prakash",
  "gv prakash",
  "hiphop tamizha",
  "santhosh narayanan",
  "pradeep kumar",
  "jonita gandhi",
  "sathyaprakash",
  "shakthisree gopalan",
  "deepak blue",
  "harris jayaraj",
  "devi sri prasad",
  "d. imman",
  "d imman",
  "imman",
  "vivek",
  "mervin solomon",
  "vishal dadlani",
  "andrea jeremiah",
  "madhu shree",
  "neeti mohan",
  "shreya ghoshal",
];

/* =========================================================
   ENGLISH ARTISTS
   ========================================================= */

const ENGLISH_ARTISTS = [
  // Pop
  "jennifer lopez",
  "the weeknd",
  "justin bieber",
  "taylor swift",
  "ed sheeran",
  "bruno mars",
  "ariana grande",
  "dua lipa",
  "billie eilish",
  "rihanna",
  "drake",
  "eminem",
  "adele",
  "lady gaga",
  "katy perry",
  "selena gomez",
  "shawn mendes",
  "charlie puth",
  "miley cyrus",
  "harry styles",
  "sam smith",
  "sia",
  "pink",
  "beyonce",
  "beyoncé",
  "britney spears",
  "christina aguilera",
  "kelly clarkson",
  "justin timberlake",
  "nick jonas",
  "jonas brothers",
  "demi lovato",
  "camila cabello",
  "halsey",
  "lorde",
  "lana del rey",
  "olivia rodrigo",
  "sabrina carpenter",
  "chappell roan",
  "doja cat",
  "megan thee stallion",
  "nicki minaj",
  "cardi b",

  // Bands
  "maroon 5",
  "coldplay",
  "one republic",
  "imagine dragons",
  "linkin park",
  "green day",
  "fall out boy",
  "backstreet boys",
  "westlife",
  "black eyed peas",
  "destiny's child",
  "little mix",
  "one direction",
  "the beatles",
  "queen",
  "abba",
  "aerosmith",
  "bon jovi",
  "u2",
  "nirvana",
  "oasis",
  "the killers",
  "foo fighters",
  "red hot chili peppers",
  "the script",
  "snow patrol",
  "train",

  // EDM / Dance
  "avicii",
  "alan walker",
  "calvin harris",
  "david guetta",
  "marshmello",
  "the chainsmokers",
  "clean bandit",
  "major lazer",
  "kygo",
  "zedd",
  "dj snake",
  "martin garrix",
  "swedish house mafia",

  // R&B / Hip-Hop
  "usher",
  "akon",
  "50 cent",
  "nelly",
  "ne yo",
  "jason derulo",
  "pitbull",
  "snoop dogg",
  "dr dre",
  "dr. dre",
  "kanye west",
  "travis scott",
  "post malone",
  "the kid laroi",
  "tyga",
  "will.i.am",

  // International
  "michael jackson",
  "madonna",
  "elton john",
  "stevie wonder",
  "whitney houston",
  "celine dion",
  "shania twain",
  "cher",
  "barry white",
  "lionel richie",
  "phil collins",
  "robbie williams",
];

/* =========================================================
   STRONG SINHALA TITLE WORDS
   ========================================================= */

const SINHALA_TITLE_WORDS = [
  "aadare",
  "adare",
  "adaray",
  "sihina",
  "sihine",
  "sihinayak",
  "hadawatha",
  "hadawathe",
  "pemwatha",
  "pemwath",
  "senehasa",
  "sithuwili",
  "sithum",
  "sithin",
  "sithata",
  "jeewithe",
  "jeewitha",
  "jeewithay",
  "premaya",
  "sandawathi",
  "lassanai",
  "kawuruda",
  "kawda",
  "numba",
  "nuba",
  "obata",
  "oyata",
  "obai",
  "ahasa",
  "ahase",
  "seethala",
  "thaniwela",
  "hamuwemu",
  "hamuwuna",
  "dawasaka",
  "durin",
  "awidin",
  "panata",
  "hiru",
  "sudu",
  "rathu",
  "malata",
  "malak",
  "yanne",
  "yanna",
  "enawa",
  "ennam",
];

/* =========================================================
   STRONG TAMIL TITLE WORDS
   ========================================================= */

const TAMIL_TITLE_WORDS = [
  "kadhal",
  "kaadhal",
  "kadhaley",
  "ennai",
  "unnai",
  "unai",
  "enakku",
  "unakku",
  "neeye",
  "uyire",
  "uyir",
  "kanave",
  "kanavu",
  "mazhai",
  "thendral",
  "anbe",
  "anbae",
  "kadavul",
  "vaanam",
  "manase",
  "appaa",
  "thalli",
  "pogathey",
  "varuven",
  "varuvaai",
  "venmegam",
  "enakoru",
  "enakkoru",
  "venumada",
  "vendumada",
];

/* =========================================================
   HELPERS
   ========================================================= */

function normalize(value: string) {
  return value
    .toLocaleLowerCase()
    .normalize("NFKC")
    .replace(/[’'".,_\-()[\]{}:/\\]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter(Boolean);
}

function containsSinhalaScript(value: string) {
  return /[\u0D80-\u0DFF]/u.test(value);
}

function containsTamilScript(value: string) {
  return /[\u0B80-\u0BFF]/u.test(value);
}

/* =========================================================
   WHOLE PHRASE MATCH
   ========================================================= */

function containsPhrase(
  text: string,
  phrase: string,
) {
  const normalizedText = normalize(text);
  const normalizedPhrase = normalize(phrase);

  if (!normalizedText || !normalizedPhrase) {
    return false;
  }

  const escaped = normalizedPhrase.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );

  return new RegExp(
    `(?:^|\\s)${escaped}(?:$|\\s)`,
    "u",
  ).test(normalizedText);
}

/* =========================================================
   WHOLE WORD MATCH
   ========================================================= */

function containsAnyWholeWord(
  text: string,
  words: string[],
) {
  const tokens = new Set(tokenize(text));

  return words.some((word) => {
    const normalizedWord = normalize(word);

    if (!normalizedWord) {
      return false;
    }

    if (normalizedWord.includes(" ")) {
      return containsPhrase(
        text,
        normalizedWord,
      );
    }

    return tokens.has(normalizedWord);
  });
}

/* =========================================================
   ARTIST MATCH
   ========================================================= */

function matchesArtist(
  artist: string,
  artists: string[],
) {
  const normalizedArtist = normalize(artist);

  return artists.some((knownArtist) => {
    const normalizedKnownArtist =
      normalize(knownArtist);

    if (!normalizedKnownArtist) {
      return false;
    }

    return (
      normalizedArtist === normalizedKnownArtist ||
      containsPhrase(
        normalizedArtist,
        normalizedKnownArtist,
      )
    );
  });
}

/* =========================================================
   RADIO.CO METADATA
   ========================================================= */

function getExplicitMetadata(
  track: RequestableTrack,
) {
  return [
    track.language,
    track.genre,
    track.category,
    ...(track.categories || []),
    ...(track.genres || []),
    ...(track.tags || []),
  ]
    .filter(
      (value): value is string =>
        typeof value === "string",
    )
    .join(" ")
    .toLocaleLowerCase();
}

/* =========================================================
   SONG-SPECIFIC OVERRIDES

   Radio.co does not expose reliable language metadata for every
   requestable track, so these exact known songs are kept in a
   small override list. This prevents transliterated songs from
   being incorrectly placed in the English tab.
   ========================================================= */

const SINHALA_SONG_OVERRIDES = [
  "eswaha katawaha",
  "eswaha_katawaha",
];

const TAMIL_SONG_OVERRIDES = [
  "enakoru girl friend",
  "enakoru girl friend vendumada",
];

function matchesSongOverride(
  title: string,
  overrides: string[],
) {
  const normalizedTitle = normalize(title);

  return overrides.some((song) => {
    const normalizedSong = normalize(song);

    return (
      normalizedTitle === normalizedSong ||
      normalizedTitle.includes(normalizedSong)
    );
  });
}

/* =========================================================
   LANGUAGE CLASSIFICATION
   ========================================================= */

function getSongLanguage(
  track: RequestableTrack,
): SongLanguage | "unknown" {
  /* Exact song overrides must run before generic heuristics. */
  if (
    matchesSongOverride(
      track.title || "",
      SINHALA_SONG_OVERRIDES,
    )
  ) {
    return "sinhala";
  }

  if (
    matchesSongOverride(
      track.title || "",
      TAMIL_SONG_OVERRIDES,
    )
  ) {
    return "tamil";
  }

  const title = normalize(
    track.title || "",
  );

  const artist = normalize(
    track.artist || "",
  );

  /*
   * -------------------------------------------------------
   * 1. EXPLICIT METADATA
   * -------------------------------------------------------
   */

  const metadata =
    getExplicitMetadata(track);

  if (
    /(^|\s)(sinhala|sinhalese|සිංහල)(\s|$)/u.test(
      metadata,
    )
  ) {
    return "sinhala";
  }

  if (
    /(^|\s)(tamil|தமிழ்)(\s|$)/u.test(
      metadata,
    )
  ) {
    return "tamil";
  }

  if (
    /(^|\s)english(\s|$)/u.test(
      metadata,
    )
  ) {
    return "english";
  }

  /*
   * -------------------------------------------------------
   * 2. REAL UNICODE SCRIPT
   * -------------------------------------------------------
   */

  if (
    containsSinhalaScript(
      track.title || "",
    ) ||
    containsSinhalaScript(
      track.artist || "",
    )
  ) {
    return "sinhala";
  }

  if (
    containsTamilScript(
      track.title || "",
    ) ||
    containsTamilScript(
      track.artist || "",
    )
  ) {
    return "tamil";
  }

  /*
   * -------------------------------------------------------
   * 3. ARTIST FIRST
   *
   * This is the most important part.
   *
   * Example:
   *
   * Ain't Your Mama
   * Jennifer Lopez
   *
   * "mama" is NOT enough to call it Sinhala.
   * Jennifer Lopez is a known English artist,
   * so the song becomes English immediately.
   * -------------------------------------------------------
   */

  if (
    matchesArtist(
      artist,
      ENGLISH_ARTISTS,
    )
  ) {
    return "english";
  }

  if (
    matchesArtist(
      artist,
      TAMIL_ARTISTS,
    )
  ) {
    return "tamil";
  }

  if (
    matchesArtist(
      artist,
      SINHALA_ARTISTS,
    )
  ) {
    return "sinhala";
  }

  /*
   * -------------------------------------------------------
   * 4. STRONG SINHALA TITLE WORDS
   * -------------------------------------------------------
   */

  const hasSinhalaTitleWord =
    containsAnyWholeWord(
      title,
      SINHALA_TITLE_WORDS,
    );

  /*
   * -------------------------------------------------------
   * 5. STRONG TAMIL TITLE WORDS
   * -------------------------------------------------------
   */

  const hasTamilTitleWord =
    containsAnyWholeWord(
      title,
      TAMIL_TITLE_WORDS,
    );

  /*
   * -------------------------------------------------------
   * 6. AMBIGUOUS RESULT
   * -------------------------------------------------------
   */

  if (
    hasSinhalaTitleWord &&
    hasTamilTitleWord
  ) {
    return "unknown";
  }

  if (hasSinhalaTitleWord) {
    return "sinhala";
  }

  if (hasTamilTitleWord) {
    return "tamil";
  }

  /*
   * -------------------------------------------------------
   * 7. UNKNOWN
   *
   * Latin/ASCII text alone is NOT enough to call a song English.
   * Many Sinhala and Tamil songs in Radio.co are stored using
   * Latin transliteration, so the old English fallback caused
   * those songs to leak into the English tab.
   * -------------------------------------------------------
   */

  return "unknown";
}

/* =========================================================
   ARTWORK
   ========================================================= */

function trackArtwork(
  track: RequestableTrack,
) {
  return (
    track.artwork?.large_url ||
    track.artwork?.url ||
    ""
  );
}


/* =========================================================
   ARTWORK WITH FALLBACK
   ========================================================= */

function ArtworkImage({
  track,
  className,
  alt = "",
}: {
  track: RequestableTrack;
  className?: string;
  alt?: string;
}) {
  const radioArtwork = trackArtwork(track);

  const [artwork, setArtwork] = useState(radioArtwork);
  const [isLoadingFallback, setIsLoadingFallback] = useState(!radioArtwork);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    let active = true;

    setArtwork(radioArtwork);
    setFallbackFailed(false);

    if (radioArtwork) {
      setIsLoadingFallback(false);
      return () => {
        active = false;
      };
    }

    const findArtwork = async () => {
      setIsLoadingFallback(true);

      try {
        const params = new URLSearchParams({
          artist: track.artist,
          title: track.title,
        });

        const response = await fetch(
          `/api/artwork?${params.toString()}`,
          { cache: "force-cache" },
        );

        if (!response.ok) {
          throw new Error("Artwork lookup failed");
        }

        const data: { artwork?: string | null } = await response.json();

        if (active && data.artwork) {
          setArtwork(data.artwork);
        } else if (active) {
          setFallbackFailed(true);
        }
      } catch {
        if (active) {
          setFallbackFailed(true);
        }
      } finally {
        if (active) {
          setIsLoadingFallback(false);
        }
      }
    };

    findArtwork();

    return () => {
      active = false;
    };
  }, [radioArtwork, track.artist, track.title]);

  if (isLoadingFallback && !artwork) {
    return (
      <div
        className={
          className ||
          "flex size-full items-center justify-center bg-[#111622]"
        }
        aria-label="Loading artwork"
      >
        <div className="size-5 animate-spin rounded-full border-2 border-[#FFD400]/20 border-t-[#FFD400]" />
      </div>
    );
  }

  if (artwork && !fallbackFailed) {
    return (
      <img
        src={artwork}
        alt={alt}
        className={className || "size-full object-cover"}
        loading="lazy"
        onError={() => {
          setArtwork("");
          setFallbackFailed(true);
        }}
      />
    );
  }

  return (
    <div
      className={
        className ||
        "flex size-full items-center justify-center bg-[#111622] text-[#FFD400]"
      }
      aria-label="Artwork unavailable"
    >
      <MusicNote />
    </div>
  );
}

/* =========================================================
   ICONS
   ========================================================= */

function MusicNote() {
  return (
    <svg
      aria-hidden="true"
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle
        cx="6"
        cy="18"
        r="3"
      />
      <circle
        cx="18"
        cy="16"
        r="3"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle
        cx="11"
        cy="11"
        r="6.5"
      />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function MusicBrowserModal({
  title,
  language,
  onClose,
}: MusicBrowserModalProps) {
  const { t } = useLanguage();
  const [tracks, setTracks] =
    useState<RequestableTrack[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [selectedTrack, setSelectedTrack] =
    useState<RequestableTrack | null>(
      null,
    );

  const [view, setView] =
    useState<View>("browse");


  const [reloadKey, setReloadKey] =
    useState(0);

  /* =======================================================
     FETCH TRACKS
     ======================================================= */

  useEffect(() => {
    let active = true;

    const fetchTracks = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await fetch(
          "/api/tracks",
          {
            cache: "no-store",
          },
        );

        const result: TracksResponse =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              "Unable to load requestable songs.",
          );
        }

        if (active) {
          setTracks(
            Array.isArray(result.data)
              ? result.data
              : [],
          );
        }
      } catch (error) {
        if (active) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load requestable songs.",
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    fetchTracks();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  /* =======================================================
     ESC KEY
     ======================================================= */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key !== "Escape") {
        return;
      }

      if (view === "confirm") {
        setSelectedTrack(null);
        setView("browse");
        return;
      }

      if (view === "confirm") {
    setSelectedTrack(null);
    setView("browse");
    return;
      }

      onClose();
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [onClose, view]);

  /* =======================================================
     CLASSIFY TRACKS
     ======================================================= */

  const classifiedTracks = useMemo(() => {
    return tracks.map((track) => ({
      track,
      language:
        getSongLanguage(track),
    }));
  }, [tracks]);

  /* =======================================================
     FILTER SELECTED LANGUAGE
     ======================================================= */

  const languageTracks = useMemo(() => {
    return classifiedTracks
      .filter(
        (item) =>
          item.language === language,
      )
      .map((item) => item.track);
  }, [
    classifiedTracks,
    language,
  ]);

  /* =======================================================
     SEARCH
     ======================================================= */

  const filteredTracks = useMemo(() => {
    const query = normalize(search);

    if (!query) {
      return languageTracks;
    }

    return languageTracks.filter(
      (track) => {
        const title = normalize(
          track.title,
        );

        const artist = normalize(
          track.artist,
        );

        return `${title} ${artist}`.includes(
          query,
        );
      },
    );
  }, [
    languageTracks,
    search,
  ]);

  /* =======================================================
     CONFIRM
     ======================================================= */

  const cancelConfirmation = () => {
    setSelectedTrack(null);
    setView("browse");
  };

const submitRequest = () => {
  if (!selectedTrack) {
    return;
  }

  setView("success");
};
  /* =======================================================
     CLOSE
     ======================================================= */

  const handleClose = () => {
  setSelectedTrack(null);
  setSearch("");
  setView("browse");

  onClose();
};

  const localizedLangName = t(`lang.${language}`);

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div className="flex h-full min-h-0 flex-col p-4 sm:p-6">

      {/* HEADER */}

      <div className="mb-4 flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] pb-4">

        <div className="min-w-0">

          <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-[#FFD400]">
            Zero FM ·{" "}
            {localizedLangName} {t("categories.music")}
          </p>

          <h2
            id="song-browser-title"
            className="mt-1 font-display text-xl font-bold text-white sm:text-2xl"
          >
            {view === "browse"
              ? title
              : view === "confirm"
                ? t("modal.confirmRequest")
                : t("modal.radioCoRequest")}
          </h2>

        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label={t("modal.close")}
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/[0.1] text-lg leading-none text-[#94A3B8] transition hover:border-[#FFD400]/40 hover:text-[#FFD400]"
        >
          ×
        </button>

      </div>

      {/* =====================================================
          BROWSE
      ====================================================== */}

      {view === "browse" && (
        <div className="flex min-h-0 flex-1 flex-col">

          {/* SEARCH */}

          <label className="mb-3 flex h-11 shrink-0 items-center gap-3 rounded-lg border border-white/[0.09] bg-[#090D16] px-3.5 text-[#8F9CAE] transition focus-within:border-[#FFD400]/45">

            <SearchIcon />

            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder={t("modal.searchSongs", { lang: localizedLangName })}
              aria-label={t("modal.searchAria", { lang: localizedLangName })}
              className="font-body min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#64748B]"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label={t("modal.clear")}
                className="font-body text-xs text-[#94A3B8] transition hover:text-[#FFD400]"
              >
                {t("modal.clear")}
              </button>
            )}

          </label>

          {/* INFO */}

          <p className="mb-3 shrink-0 text-[9px] leading-4 text-[#64748B]">
            {t("modal.showingCatalogue", { lang: localizedLangName })}
          </p>

          {/* COUNT */}

          <div className="mb-2 grid shrink-0 grid-cols-[minmax(0,1fr)_auto] items-center px-1 font-mono text-[8px] uppercase tracking-[0.1em] text-[#64748B]">

            <span>
              {t("modal.availableSongs")}
            </span>

            {!isLoading &&
              !loadError && (
                <span>
                  {filteredTracks.length}{" "}
                  {t("modal.tracks")}
                </span>
              )}

          </div>

          {/* SONG LIST */}

          <div className="request-song-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-lg border border-white/[0.06] bg-[#090D16]">

            {/* LOADING */}

            {isLoading ? (
              <div
                className="space-y-1 p-3"
                role="status"
                aria-label={t("modal.loadingSongs")}
              >
                {Array.from(
                  { length: 8 },
                  (_, index) => (
                    <div
                      key={index}
                      className="h-[68px] animate-pulse rounded-lg bg-white/[0.035]"
                    />
                  ),
                )}
              </div>

            ) : loadError ? (

              /* ERROR */

              <div
                className="flex min-h-48 flex-col items-center justify-center gap-3 p-5 text-center"
                role="alert"
              >

                <p className="text-sm text-[#C3CBD7]">
                  {t("modal.unableToLoad")}
                </p>

                <p className="max-w-md text-xs leading-5 text-[#8F9CAE]">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setReloadKey(
                      (key) =>
                        key + 1,
                    )
                  }
                  className="rounded-full border border-[#FFD400]/35 px-4 py-2 font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[#FFD400] transition hover:bg-[#FFD400]/[0.08]"
                >
                  {t("modal.retry")}
                </button>

              </div>

            ) : filteredTracks.length === 0 ? (

              /* NO SONGS */

              <div
                className="flex min-h-48 flex-col items-center justify-center px-5 text-center"
                role="status"
              >

                <div className="mb-3 flex size-11 items-center justify-center rounded-full border border-white/[0.08] bg-[#111622] text-[#FFD400]">
                  <MusicNote />
                </div>

                <p className="text-sm text-[#C3CBD7]">
                  {t("modal.noSongsFound", { lang: localizedLangName })}
                </p>

                <p className="mt-2 max-w-md text-xs leading-5 text-[#64748B]">
                  {search
                    ? t("modal.tryAnother")
                    : t("modal.noSongsClassified")}
                </p>

              </div>

            ) : (

              /* SONGS */

              <ul className="divide-y divide-white/[0.06]">

                {filteredTracks.map(
                  (track) => {
                    return (
                      <li
                        key={track.id}
                      >

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTrack(
                              track,
                            );
                            setView(
                              "confirm",
                            );
                          }}
                          aria-label={t("modal.requestAria", { title: track.title, artist: track.artist })}
                          className="group flex w-full min-w-0 items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[#121826] focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-[#FFD400] sm:gap-4 sm:px-4"
                        >

                          {/* ARTWORK */}

                          <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.07] bg-[#111622] text-[#FFD400]">

                            <ArtworkImage
                              track={track}
                              className="size-full object-cover"
                            />

                          </span>

                          {/* INFO */}

                          <span className="min-w-0 flex-1">

                            <span className="block truncate font-display text-sm font-semibold text-white">
                              {
                                track.title
                              }
                            </span>

                            <span className="font-body mt-1 block truncate text-xs text-[#8F9CAE]">
                              {
                                track.artist
                              }
                            </span>

                          </span>

                          {/* QUEUE */}

                          <span
                            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#FFD400]/30 bg-[#FFD400]/[0.08] text-[#FFD400] transition group-hover:border-[#FFD400] group-hover:bg-[#FFD400] group-hover:text-[#090D16]"
                            aria-hidden="true"
                          >
                            <CheckIcon />
                          </span>

                        </button>

                      </li>
                    );
                  },
                )}

              </ul>

            )}

          </div>

        </div>
      )}

      {/* =====================================================
          CONFIRM
      ====================================================== */}

      {view === "confirm" &&
        selectedTrack && (
          <div className="flex min-h-0 flex-1 flex-col">

            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-5 sm:flex-row sm:gap-8">

              {/* COVER */}

              <span className="flex size-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111622] text-[#FFD400] shadow-2xl sm:size-48">

                <ArtworkImage
                  track={selectedTrack}
                  alt={`${selectedTrack.title} artwork`}
                  className="size-full object-cover"
                />

              </span>

              {/* INFO */}

              <div className="min-w-0 text-center sm:text-left">

                <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-[#FFD400]">
                  {localizedLangName}{" "}
                  {t("categories.music")}
                </p>

                <h3 className="mt-2 break-words font-display text-2xl font-bold text-white sm:text-3xl">
                  {
                    selectedTrack.title
                  }
                </h3>

                <p className="font-body mt-2 break-words text-sm text-[#8F9CAE]">
                  {
                    selectedTrack.artist
                  }
                </p>

                <p className="mt-5 max-w-sm text-xs leading-5 text-[#64748B]">
                  {t("modal.addToQueueDesc")}
                </p>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex shrink-0 flex-col-reverse justify-end gap-2 border-t border-white/[0.08] pt-4 sm:flex-row">

              <button
                type="button"
                onClick={
                  cancelConfirmation
                }
                className="h-11 rounded-lg border border-white/[0.12] px-6 font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-white/80 transition hover:border-white/25 hover:text-white"
              >
                {t("modal.backToSongs")}
              </button>

              <button
                    type="button"
                    onClick={submitRequest}
                    className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#FFD400] px-7 font-body text-[10px] font-bold uppercase tracking-[0.06em] text-[#090D16] transition hover:bg-[#ffe45c]"
                    >
                    <CheckIcon />
                    ADD TO QUEUE
                    </button>

            </div>

          </div>
        )}

      {/* =====================================================
          RADIO.CO REQUEST
      ====================================================== */}

{view === "success" && selectedTrack && (
  <div className="flex min-h-0 flex-1 flex-col">

    <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
      <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-[#FFD400]">
        Request Received
      </p>

      <button
        type="button"
        onClick={() => {
          setSelectedTrack(null);
          setView("browse");
        }}
        className="font-body text-[10px] font-semibold uppercase tracking-[0.06em] text-[#FFD400] hover:text-white"
      >
        Go Back
      </button>
    </div>

    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-[#2e2e2e]">

      <div className="flex shrink-0 items-center justify-between border-b border-black/20 px-4 py-4 sm:px-5">
        <h3 className="font-display text-base font-semibold text-white">
          Request Received
        </h3>

        <button
          type="button"
          onClick={() => {
            setSelectedTrack(null);
            setView("browse");
          }}
          className="flex items-center gap-1 font-body text-xs font-medium text-[#FFD400] transition hover:text-white"
        >
          <span aria-hidden="true">↶</span>
          Go Back
        </button>
      </div>

      <div className="flex min-h-[280px] flex-1 flex-col items-center justify-center px-6 py-8 text-center">

        <div className="flex size-24 items-center justify-center overflow-hidden bg-[#FFD400] sm:size-28">
          <ArtworkImage
            track={selectedTrack}
            alt={`${selectedTrack.title} artwork`}
            className="size-full object-cover"
          />
        </div>

        <h4 className="mt-5 font-display text-lg font-semibold text-white sm:text-xl">
          {selectedTrack.title}
        </h4>

        <p className="font-body mt-2 text-sm text-[#C5C5C5]">
          {selectedTrack.artist}
        </p>

        <p className="mt-4 max-w-md font-body text-sm leading-6 text-[#E2E2E2]">
          Your request has been added to the queue.
        </p>

      </div>
    </div>

  </div>
)}
    </div>
  );
}