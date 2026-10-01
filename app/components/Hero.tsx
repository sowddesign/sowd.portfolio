export default function Hero() {
  return (
    <section
      className="relative w-full shrink-0 overflow-x-hidden"
      style={{
        aspectRatio: "1440 / 843",
        background:
          "linear-gradient(-61.34deg, rgba(255,255,255,0.25) 27.08%, rgba(254,247,230,0.25) 119.25%), linear-gradient(-64.76deg, rgba(0,0,0,0.18) 7.87%, rgba(42,42,42,0.157) 25.25%, rgba(255,255,255,0) 50.91%), linear-gradient(90deg, #f2f2f2 0%, #f2f2f2 100%)",
      }}
    >
      {/* Grid bars */}
      <div
        className="absolute flex gap-6 items-stretch"
        style={{ inset: "0 -332px" }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              background:
                "linear-gradient(to bottom, rgba(254,247,230,0) 0%, rgba(255,255,255,0) 100%)",
            }}
          />
        ))}
      </div>

      {/* Sunflower / visuel background */}
      <div
        className="absolute overflow-hidden"
        style={{
          width: 2108,
          height: 1687,
          left: "calc(50% - 2px)",
          top: "calc(50% + 422px)",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/visuel-background.png"
          alt=""
          className="absolute max-w-none w-full"
          style={{ height: "103.14%", left: 0, top: "-3.16%" }}
        />

        {/* Showreel area */}
        <div
          className="absolute cursor-pointer"
          style={{ inset: "12.38% 39.58% 70.43% 39.58%" }}
        >
          {/* Info text — positioned to the right of the laptop screen */}
          <div
            className="absolute font-sans text-[14px] leading-4 tracking-[-0.84px] text-black"
            style={{ right: -244, top: 0, width: 215 }}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <p className="font-normal">{`1'27" —  showreel`}</p>
                <p className="italic">{`réalisé  avec  after  effect`}</p>
              </div>
              <div className="flex flex-col gap-4">
                <p>{`Game  et  UX/UI  Designer`}</p>
                <p>{`projets  réalisés  au  cours  de  mes études`}</p>
              </div>
            </div>
          </div>

          {/* Video frame */}
          <div className="absolute inset-0 rounded-tl-lg rounded-tr-lg bg-black opacity-90" />
        </div>
      </div>

      {/* Dark gradient transition to Démarche UX */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: -1218,
          left: -334,
          width: 2108,
          height: 1310,
          background:
            "linear-gradient(180.41deg, rgba(0,0,0,0) 1.65%, rgba(0,0,0,0.548) 14.75%, rgb(0,0,0) 46.17%)",
        }}
      />
    </section>
  );
}
