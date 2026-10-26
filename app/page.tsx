import { Icon } from "@/components/ui/Icon";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col gap-xl p-xxl bg-background-brand-bright">
      <h1 className="type-h1 text-text-brand-somber">sowd</h1>
      <p className="type-body-regular">Base du portfolio : tokens et icônes en place.</p>
      <span className="inline-flex w-fit items-center gap-xs rounded-rounded px-lg py-sm shadow-low bg-background-buttons-brand-mid type-button">
        Découvrir
        <Icon name="ArrowRight" size={20} />
      </span>
    </main>
  );
}
