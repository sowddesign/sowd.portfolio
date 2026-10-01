const NAV_LINKS = [
  { label: "accueil", href: "#" },
  { label: "services", href: "#services" },
  { label: "projets", href: "#projets" },
  { label: "à propos", href: "#a-propos" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white w-full">
      <div className="relative h-14 flex items-center">
        {/* Logotype */}
        <div
          className="absolute flex items-center justify-start py-4"
          style={{ left: 24, right: 1086 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logotype.svg"
            alt="sowd|design"
            className="h-[25px] w-auto"
          />
        </div>

        {/* Nav links */}
        <div
          className="absolute flex items-center"
          style={{ left: "49.44%", right: "18.06%" }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="flex h-11 w-[94px] items-center justify-center font-sans text-[14px] leading-6 tracking-[-0.28px] text-black hover:opacity-60 transition-opacity"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Contact button */}
        <div
          className="absolute flex items-center justify-end"
          style={{ left: 1086, right: 24 }}
        >
          <a
            href="#contact"
            className="flex h-14 w-[94px] items-center justify-center gap-2 font-sans text-[14px] leading-6 tracking-[-0.28px] text-black hover:opacity-60 transition-opacity"
          >
            <span>contact</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/contact-arrow.svg"
              alt=""
              width={24}
              height={24}
            />
          </a>
        </div>
      </div>

      {/* Bottom separator */}
      <div className="h-px bg-black" />
    </header>
  );
}
