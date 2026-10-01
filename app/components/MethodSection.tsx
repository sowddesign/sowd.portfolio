"use client";

import { useState } from "react";

const STEPS = [
  { number: "01", label: "Recherches quantitatives" },
  { number: "02", label: "Benchmarks" },
  { number: "03", label: "Interviews utilisateurs" },
  { number: "04", label: "Observations terrain" },
  { number: "05", label: "Ateliers d'exploration" },
];

function Separator() {
  return (
    <div className="h-px w-full shrink-0 bg-black" />
  );
}

export default function MethodSection() {
  const [selectedStep, setSelectedStep] = useState(0);

  return (
    <section className="flex flex-col items-start w-full bg-white pt-24">
      {/* Heading */}
      <div className="border-b border-black w-full px-6 shrink-0">
        <p className="font-heading font-bold text-[80px] leading-[88px] tracking-[-1.6px] text-black whitespace-nowrap">
          appliquer la méthode
        </p>
      </div>

      {/* Method container */}
      <div className="flex flex-col items-start w-full bg-white">
        {/* Title row with nav */}
        <div className="flex gap-0 items-end w-full shrink-0">
          {/* Phase label + title */}
          <div className="flex-1 flex items-center justify-between px-6">
            <div className="flex flex-row items-center self-stretch">
              <div className="flex flex-col gap-1 h-full items-center justify-end py-3">
                <p className="font-sans font-normal text-[14px] leading-4 tracking-[-0.84px] text-black whitespace-pre">
                  {`comprendre  le  problème`}
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <p className="font-sans font-medium text-[60px] leading-[68px] tracking-[-1.2px] text-black whitespace-nowrap">
                Découvrir
              </p>
            </div>
          </div>

          {/* Prev / Next */}
          <div className="flex flex-1 flex-row items-end self-stretch">
            <div className="flex flex-1 gap-3 h-full items-end px-6">
              <button
                onClick={() => setSelectedStep((s) => Math.max(0, s - 1))}
                className="flex gap-2 h-11 items-center justify-center px-3 text-[14px] leading-6 tracking-[-0.28px] text-neutral-300 hover:text-black transition-colors"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/contact-arrow-1.svg" alt="" width={24} height={24} />
                <span className="font-sans">précédente</span>
              </button>
              <button
                onClick={() => setSelectedStep((s) => Math.min(STEPS.length - 1, s + 1))}
                className="flex gap-2 h-11 items-center justify-center px-3 text-[14px] leading-6 tracking-[-0.28px] text-black hover:opacity-60 transition-opacity cursor-pointer"
              >
                <span className="font-sans">suivante</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/contact-arrow-2.svg" alt="" width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Steps + content */}
        <div className="flex gap-0 h-[715px] items-start overflow-hidden w-full shrink-0">
          {/* Steps list */}
          <div className="flex flex-1 flex-col h-full overflow-hidden">
            <Separator />
            {STEPS.map((step, i) => (
              <div key={step.number}>
                <button
                  onClick={() => setSelectedStep(i)}
                  className="flex gap-6 items-center justify-center w-full cursor-pointer hover:bg-black/5 transition-colors"
                >
                  <div
                    className={`flex flex-1 gap-6 items-center justify-center min-w-0 px-6 py-3 ${
                      i === selectedStep ? "bg-black/5" : ""
                    }`}
                  >
                    <p className="font-sans font-normal text-[20px] leading-8 tracking-[-0.4px] text-black w-[93px] shrink-0">
                      {step.number}
                    </p>
                    <p className="flex-1 font-sans font-normal text-[20px] leading-8 tracking-[-0.4px] text-black min-w-0">
                      {step.label}
                    </p>
                  </div>
                </button>
                <Separator />
              </div>
            ))}
          </div>

          {/* Vertical separator */}
          <div className="w-px bg-black h-full shrink-0" />

          {/* Content area */}
          <div className="flex-1 h-full relative">
            <Separator />
            <div className="flex-1 min-h-px w-full h-full" />
            <Separator />
          </div>
        </div>
      </div>
    </section>
  );
}
