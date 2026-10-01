function Separator({ white = false }: { white?: boolean }) {
  return (
    <div className="h-px w-full shrink-0">
      <div className={`h-full w-full ${white ? "bg-white" : "bg-black"}`} />
    </div>
  );
}

export default function DemarcheUX() {
  return (
    <section className="flex flex-col items-start w-full bg-black text-white">
      {/* "Démarche UX" heading row */}
      <div className="border-b border-white w-full px-6 shrink-0">
        <p className="font-sans font-bold text-[200px] leading-[200px] tracking-[-4px] text-white whitespace-nowrap">
          Démarche UX
        </p>
      </div>

      <Separator white />

      {/* "Méthode : double diamant" */}
      <div className="w-full px-6 py-0 shrink-0">
        <div className="flex items-center gap-2 py-0">
          <div className="flex-1">
            <div className="flex flex-col gap-2">
              <p className="font-sans font-normal text-[14px] leading-4 tracking-[-0.84px] text-white">
                Méthode :
              </p>
              <div className="flex gap-2 items-start font-heading font-bold text-[80px] leading-[88px] tracking-[-1.6px] text-white">
                <span>double</span>
                <span>diamant</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator white />

      {/* Double diamond visualization */}
      <div className="w-full overflow-hidden shrink-0 relative">
        {/* Center vertical separator */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white -translate-x-1/2" />

        {/* Double flower SVG - empty state */}
        <div className="relative w-full h-[715px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/empty-sunfl-1.png"
            alt="Double diamond methodology"
            className="absolute max-w-none"
            style={{
              height: "108.63%",
              left: "3.01%",
              top: 0,
              width: "93.98%",
            }}
          />

          {/* Labels at axes */}
          <p className="absolute font-sans font-semibold text-[14px] leading-6 tracking-[-0.28px] text-white whitespace-nowrap"
             style={{ left: "calc(66.67% + 8px)", top: 667 }}>
            livrer
          </p>
          <p className="absolute font-sans font-semibold text-[14px] leading-6 tracking-[-0.28px] text-white whitespace-nowrap"
             style={{ left: "calc(33.33% + 16px)", top: 655 }}>
            définir
          </p>
          <p className="absolute font-sans font-semibold text-[14px] leading-6 tracking-[-0.28px] text-white whitespace-nowrap"
             style={{ top: "3.36%", left: "28.4%" }}>
            découvrir
          </p>
          <p className="absolute font-sans font-semibold text-[14px] leading-6 tracking-[-0.28px] text-white whitespace-nowrap"
             style={{ top: "9.79%", left: "61.18%" }}>
            développer
          </p>

          {/* problème / solution */}
          <div className="absolute flex flex-col gap-1 items-center justify-center"
               style={{ top: "52.31%", left: "1.67%", right: "91.81%", bottom: "44.76%" }}>
            <p className="font-sans font-semibold text-[14px] leading-4 tracking-[-0.84px] text-white text-center w-full">
              problème
            </p>
            <div className="h-px w-full" style={{ background: "#fcdf9c" }} />
          </div>
          <div className="absolute flex flex-col gap-1 items-center justify-center"
               style={{ top: "52.31%", right: "1.67%", left: "91.81%", bottom: "44.76%" }}>
            <p className="font-sans font-semibold text-[14px] leading-4 tracking-[-0.84px] text-white text-center w-full">
              solution
            </p>
            <div className="h-px w-full" style={{ background: "#fcdf9c" }} />
          </div>
        </div>
      </div>

      <Separator white />

      {/* Copyright */}
      <div className="flex items-center justify-end gap-6 px-6 py-3 w-full shrink-0">
        <p className="font-sans font-normal text-[14px] leading-4 tracking-[-0.84px] text-[#fef7e6] whitespace-pre-wrap">
          {`© 2026  Tom  Lamy /sowd.design  —  Création  graphique  originale.`}
        </p>
      </div>
    </section>
  );
}
