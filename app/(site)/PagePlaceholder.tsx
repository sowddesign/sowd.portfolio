/*
 * Contenu provisoire d'une page, en attendant le design : bloc blanc de 1200px de haut
 * (hauteur demandée par l'utilisateur) avec le nom de la page en H1 et ses ancres en H2.
 */

export type PagePlaceholderProps = {
  title: string;
  anchors?: { id: string; label: string }[];
};

export function PagePlaceholder({ title, anchors = [] }: PagePlaceholderProps) {
  return (
    <div className="flex h-[1200px] w-full flex-col gap-lg bg-background-neutral-white px-(--grid-spacing) py-lg text-text-neutral-black">
      <h1 className="type-h1">{title}</h1>
      {anchors.map(({ id, label }) => (
        <h2 key={id} id={id} className="type-h2">
          {label}
        </h2>
      ))}
    </div>
  );
}
