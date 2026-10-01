export default function WorkTogether() {
  return (
    <div className="fixed bottom-[92px] right-0 z-40 flex flex-col h-[114px] items-end justify-center pl-6 pr-2 py-6">
      <div className="flex flex-1 gap-4 items-center min-h-0 px-2 py-6">
        <div className="relative shrink-0 size-8 opacity-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/fond.svg"
            alt=""
            className="absolute inset-0 block size-full rotate-180"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo.svg"
            alt=""
            className="absolute inset-0 block size-full"
          />
        </div>
      </div>
    </div>
  );
}
