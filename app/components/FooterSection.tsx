const NAV_LINKS = [
  "Showreel",
  "Démarche UX",
  "Services",
  "Projets",
  "À propos",
];

function Separator() {
  return <div className="h-px w-full shrink-0 bg-black" />;
}

export default function FooterSection() {
  return (
    <footer id="contact" className="flex flex-col items-start w-full bg-white pt-24 pb-6">
      <Separator />

      {/* Main footer content */}
      <div className="flex gap-6 items-start px-6 w-full">
        {/* Contact column */}
        <div className="flex flex-col gap-6 items-start shrink-0 w-[330px] self-stretch">
          <div className="flex gap-3 items-center w-[212px]">
            <p className="font-sans font-semibold text-[20px] leading-8 tracking-[-0.4px] text-black whitespace-nowrap">
              Me contacter :
            </p>
          </div>

          <div className="flex flex-col items-start w-full">
            {/* Linkedin */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-between py-2 w-full hover:opacity-60 transition-opacity"
            >
              <p className="font-sans font-normal text-[14px] leading-6 tracking-[-0.28px] text-black whitespace-nowrap">
                Linkedin
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/arrow-up-right.svg"
                alt=""
                className="aspect-square h-full shrink-0"
              />
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-between py-2 w-full hover:opacity-60 transition-opacity"
            >
              <p className="font-sans font-normal text-[14px] leading-6 tracking-[-0.28px] text-black whitespace-nowrap">
                Instagram
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/arrow-up-right.svg"
                alt=""
                className="aspect-square h-full shrink-0"
              />
            </a>

            <Separator />

            {/* Email */}
            <a
              href="mailto:sowd.design@gmail.com"
              className="flex h-11 items-center justify-between py-2 w-full hover:opacity-60 transition-opacity"
            >
              <p className="font-sans font-normal text-[14px] leading-6 tracking-[-0.28px] text-black whitespace-nowrap">
                sowd.design@gmail.com
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/arrow-right.svg"
                alt=""
                className="aspect-square h-full shrink-0"
              />
            </a>

            <Separator />

            {/* Phone */}
            <div className="flex gap-3 h-11 items-center py-2 w-full">
              <p className="font-sans font-normal text-[14px] leading-6 tracking-[-0.28px] text-black whitespace-nowrap">
                06.66.04.79.21
              </p>
            </div>

            <Separator />
          </div>
        </div>

        {/* Navigation column */}
        <div className="flex flex-1 flex-col gap-6 items-start min-w-0">
          <div className="flex gap-3 items-center w-[212px]">
            <p className="font-sans font-semibold text-[20px] leading-8 tracking-[-0.4px] text-black whitespace-nowrap">
              Naviguer :
            </p>
          </div>

          <div className="flex flex-col items-start w-full">
            {NAV_LINKS.map((link) => (
              <div key={link}>
                <a
                  href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex h-[134px] items-center justify-between py-[6px] w-full hover:opacity-60 transition-opacity group"
                >
                  <p className="font-sans font-medium text-[96px] leading-[120px] tracking-[-1.92px] text-black whitespace-nowrap shrink-0">
                    {link}
                  </p>
                </a>
                <Separator />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex gap-6 h-[17px] items-end justify-center px-6 w-full mt-6">
        {/* Copyright */}
        <div className="flex h-full items-end shrink-0 w-[330px]">
          <div className="flex gap-1 items-start">
            <div className="flex items-start">
              <p className="font-sans font-normal text-[11px] leading-4 tracking-[-0.66px] text-black whitespace-nowrap">
                sowd.design
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/copyright.svg"
                alt="©"
                className="size-2 shrink-0"
              />
            </div>
            <p className="font-sans font-normal text-[11px] leading-4 tracking-[-0.66px] text-black whitespace-nowrap">
              2026
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="flex flex-1 gap-2 h-full items-end min-w-0 bg-white">
          <p className="font-sans font-normal text-[11px] leading-4 tracking-[-0.66px] text-black whitespace-nowrap shrink-0">
            Privacy Policy
          </p>
          <p className="font-sans font-normal text-[11px] leading-4 tracking-[-0.66px] text-black whitespace-nowrap shrink-0">
            &amp;
          </p>
          <p className="font-sans font-normal text-[11px] leading-4 tracking-[-0.66px] text-black whitespace-nowrap shrink-0">
            Legal terms
          </p>
        </div>

        {/* "site designé par" + wordmark */}
        <div className="flex flex-1 gap-6 h-full items-end justify-end min-w-0">
          <p className="font-sans font-normal text-[14px] leading-4 tracking-[-0.84px] text-black whitespace-nowrap shrink-0">
            site designé par
          </p>
          <div className="flex flex-col h-full items-start shrink-0">
            <div className="relative flex-1 min-h-0" style={{ aspectRatio: "241/40" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/vector.svg"
                alt=""
                className="absolute"
                style={{ inset: "0 0 21.96% 49.81%" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/vector-1.svg"
                alt=""
                className="absolute"
                style={{ inset: "0.06% 52.41% -0.29% 46.28%" }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/vector-2.svg"
                alt=""
                className="absolute"
                style={{ inset: "0 55.92% -0.35% 0" }}
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
