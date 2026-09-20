import type {Store} from '@/lib/catalog';

export function StoreLogo({store,className=''}:{store:Store;className?:string}) {
  return <span className={`store-logo-image ${className}`} data-store={store.id}>
    <img src={`/images/stores/${store.id}.png`} alt={`${store.name} logo`} width={112} height={56} decoding="async"/>
  </span>;
}
