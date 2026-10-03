import {hasPhoto, productById, productPhotoPath} from '@/lib/catalog';
import {glyphFor, type GlyphSource} from '@/lib/product-glyph';
import {cn} from '@/lib/utils';

/**
 * A grocery item's picture: the photograph when `npm run photos` has fetched
 * one, otherwise the department's colour and a symbol for the aisle. It is
 * decorative, since the item's name is always written beside it.
 */
export function ProductArt({
  id,
  item,
  small = false,
  className,
}: {
  /** Catalogue id. Unmatched list lines have none. */
  id?: string | null;
  /** Where the record is a taxonomy item rather than a catalogue product. */
  item?: GlyphSource | null;
  small?: boolean;
  className?: string;
}) {
  const source = item ?? (id ? productById[id] : null);
  const Glyph = glyphFor(source);
  const department = source?.departmentId;
  return (
    <span
      className={cn('product-art', small && 'small', department && `dept-${department}`, className)}
      aria-hidden="true"
    >
      {id && hasPhoto(id) ? (
        <img src={productPhotoPath(id)} alt="" loading="lazy" decoding="async" />
      ) : (
        <Glyph />
      )}
    </span>
  );
}
