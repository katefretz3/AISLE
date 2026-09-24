import type {Store} from '@/lib/catalog';

/**
 * A chain's mark. `store` may be a retailer the agent discovered rather than one
 * of the bundled chains, so both the id and the image are treated as optional:
 * a missing PNG falls back to initials instead of a broken image.
 */
export function StoreLogo({store,className=''}:{store:Pick<Store,'id'|'name'>;className?:string}) {
  const initials=store.name.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  return <span className={`store-logo-image ${className}`} data-store={store.id}>
    <img src={`/images/stores/${store.id}.png`} alt={`${store.name} logo`} width={112} height={56}
      decoding="async"
      onError={event=>{
        const img=event.currentTarget;
        img.style.display='none';
        const host=img.parentElement;
        if(host&&!host.querySelector('.store-logo-fallback')){
          const span=document.createElement('span');
          span.className='store-logo-fallback';
          span.textContent=initials;
          host.appendChild(span);
        }
      }}/>
  </span>;
}
