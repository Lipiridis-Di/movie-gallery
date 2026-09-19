// Горизонтальный скроллящийся ряд актёров — типичный паттерн для такого списка,
// вместо переноса на новую строку. overflow-x-auto включает горизонтальную прокрутку,
// flex-shrink-0 на карточке актёра не даёт ей сжиматься, чтобы влезть в ряд.

import { posterUrl } from '@/shared/api/images'
import type { CastMember } from '../model/types'

interface CastListProps {
  cast: CastMember[]
}

export function CastList({ cast }: CastListProps) {
  if (cast.length === 0) return null

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-3">В ролях</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {cast.slice(0, 12).map((member) => {
          const photo = posterUrl(member.profile_path, 'w200')
          return (
            <div key={member.id} className="flex-shrink-0 w-24 text-center">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-200 mb-2">
                {photo ? (
                  <img
                    src={photo}
                    alt={member.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    Нет фото
                  </div>
                )}
              </div>
              <p className="text-xs font-medium text-slate-900 line-clamp-2">{member.name}</p>
              <p className="text-xs text-slate-500 line-clamp-1">{member.character}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
