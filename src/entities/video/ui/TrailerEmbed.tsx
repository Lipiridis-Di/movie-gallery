// Встраиваем ролик с YouTube через iframe. YouTube принимает видео по такому шаблону адреса:
// https://www.youtube.com/embed/<videoKey> — videoKey это как раз то, что TMDB отдаёт
// в поле `key` у видео с site === "YouTube".
//
// aspect-video (Tailwind) держит соотношение сторон 16:9 у контейнера, а iframe внутри
// растягивается на всю его площадь (absolute + inset-0) — стандартный приём для отзывчивого
// видео, чтобы плеер не "прыгал" по размеру на разных экранах.

interface TrailerEmbedProps {
  videoKey: string
}

export function TrailerEmbed({ videoKey }: TrailerEmbedProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">Трейлер</h2>
      <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoKey}`}
          title="Трейлер"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}
