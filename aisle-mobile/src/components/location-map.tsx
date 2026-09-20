"use client";
import {useEffect,useRef,useState} from 'react';
import {LocateFixed,MapPin,RotateCcw,TriangleAlert} from 'lucide-react';
import type {Map as LeafletMap,Marker,Circle,TileLayer} from 'leaflet';
import {Slider} from '@/components/ui/slider';
import {cityLocation,type SearchLocation} from '@/lib/locations';
import 'leaflet/dist/leaflet.css';

type Props={city:string;location:SearchLocation;radius:number;onLocation:(point:SearchLocation)=>void;onRadius:(radius:number)=>void};
const selectedPoint=(lat:number,lng:number,city:string):SearchLocation=>({lat:Number(Math.max(-85,Math.min(85,lat)).toFixed(6)),lng:Number((((lng+180)%360+360)%360-180).toFixed(6)),city,custom:true});
export default function LocationMap({city,location,radius,onLocation,onRadius}:Props){
  const element=useRef<HTMLDivElement>(null);
  const instance=useRef<{map:LeafletMap;marker:Marker;circle:Circle;tiles:TileLayer}|null>(null);
  const current=useRef({location,radius,onLocation,city});
  current.current={location,radius,onLocation,city};
  const [ready,setReady]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let disposed=false;let resize:ResizeObserver|undefined;let createdMap:LeafletMap|undefined;
    setReady(false);setError('');
    import('leaflet').then(L=>{
      if(disposed||!element.current)return;
      const value=current.current;
      const map=L.map(element.current,{center:[value.location.lat,value.location.lng],zoom:11,scrollWheelZoom:false,zoomControl:true,minZoom:5,maxZoom:18,zoomAnimation:false,fadeAnimation:false,attributionControl:true});
      createdMap=map;
      map.attributionControl.setPrefix(false);
      const tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'}).addTo(map);
      tiles.on('tileerror',()=>{if(!disposed)setError('The map tiles could not load. Check your connection and retry.');});
      tiles.on('tileload',()=>{if(!disposed)setError('');});
      const point=L.latLng(value.location.lat,value.location.lng);
      const circle=L.circle(point,{radius:value.radius*1000,color:'#164b3e',weight:2,fillColor:'#8cab54',fillOpacity:.15,interactive:false}).addTo(map);
      const marker=L.marker(point,{draggable:true,autoPan:true,title:'Drag to choose your search location',alt:'Selected search location',icon:L.divIcon({className:'aisle-map-marker',html:'<span></span>',iconSize:[28,28],iconAnchor:[14,14]})}).addTo(map);
      const select=(lat:number,lng:number)=>{
        const position=selectedPoint(lat,lng,current.current.city);
        marker.setLatLng(position);circle.setLatLng(position);current.current.onLocation(position);
      };
      map.on('click',event=>select(event.latlng.lat,event.latlng.lng));
      marker.on('drag',()=>circle.setLatLng(marker.getLatLng()));
      marker.on('dragend',()=>{const point=marker.getLatLng();select(point.lat,point.lng);});
      map.fitBounds(circle.getBounds(),{padding:[24,24],animate:false});
      instance.current={map,marker,circle,tiles};
      resize=new ResizeObserver(()=>map.invalidateSize({pan:false}));resize.observe(element.current);
      setReady(true);
    }).catch(cause=>{console.warn('Map initialization failed:',cause);createdMap?.remove();createdMap=undefined;if(!disposed)setError('The map could not open. Please retry.');});
    return()=>{disposed=true;resize?.disconnect();createdMap?.remove();instance.current=null;};
  },[retry]);
  useEffect(()=>{
    const controller=instance.current;if(!controller)return;
    controller.marker.setLatLng(location);controller.circle.setLatLng(location).setRadius(radius*1000);
    // A new city must move the viewport; selecting a point keeps the user's zoom.
    if(!location.custom)controller.map.setView(location,controller.map.getZoom(),{animate:false});
  },[ready,location.lat,location.lng,location.custom,radius]);
  const reset=()=>{const centre=cityLocation(city);onLocation(centre);instance.current?.map.setView(centre,11,{animate:false});};
  const useCentre=()=>{const point=instance.current?.map.getCenter();if(point)onLocation(selectedPoint(point.lat,point.lng,city));};
  const showArea=()=>{const c=instance.current;if(c)c.map.fitBounds(c.circle.getBounds(),{padding:[24,24],animate:false});};
  return <section className="location-picker" aria-label="Choose your search area">
    <div className="location-picker-title"><div><strong>Your search area</strong><p>{location.custom?'Custom search point':`${city} city centre`}</p></div><span className="radius-value">{radius}<small> km</small></span></div>
    <Slider className="location-slider" aria-label="Search radius in kilometres" min={1} max={25} step={1} value={[radius]} onValueChange={values=>onRadius(values[0])}/>
    <div className="radius-scale"><span>1 km</span><span>25 km</span></div>
    <div className="location-map-frame"><div ref={element} className="location-map" role="region" aria-label={`Interactive map around ${city}. Tap to set your search location.`}/>{!ready&&!error&&<div className="map-loading">Loading your map…</div>}</div>
    {error&&<div role="status" className="map-error"><TriangleAlert size={16}/><span>{error}</span><button onClick={()=>setRetry(v=>v+1)}>Retry</button></div>}
    <div className="map-actions"><button type="button" disabled={!ready} onClick={useCentre}><MapPin size={15}/>Use map centre</button><button type="button" disabled={!ready} onClick={showArea}><LocateFixed size={15}/>Show radius</button><button type="button" disabled={!ready} onClick={reset}><RotateCcw size={15}/>Reset</button></div>
    <p className="map-instruction">Tap the map or drag the pin to change location. Pan and pinch to explore; use + / − to zoom.</p>
    <output className="location-coordinates" aria-live="polite">Search point: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</output>
  </section>;
}
