const SKILLS = [
  "Designer",
  "UX",
  "UI",
  "Co-Conception",
  "Gamification",
  "Design Systems",
  "Branding",
];

export default function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 h-[92px] flex items-end justify-center px-6 py-3 bg-transparent pointer-events-none">
      <div className="flex flex-1 gap-6 items-center justify-center">
        {SKILLS.map((skill) => (
          <p
            key={skill}
            className="font-sans font-normal text-[14px] leading-4 tracking-[-0.84px] text-white whitespace-nowrap shrink-0"
          >
            {skill}
          </p>
        ))}
      </div>
    </div>
  );
}
