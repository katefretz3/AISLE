export type SearchLocation={lat:number;lng:number;city:string;custom:boolean};
// City reference coordinates: GeoNames via Open-Meteo geocoding, retrieved 2026-09-19.
// https://open-meteo.com/en/docs/geocoding-api — place data © GeoNames, CC BY 4.0.
export const ontarioCities=[
  {name:'Barrie',lat:44.40011,lng:-79.66634},
  {name:'Brampton',lat:43.68341,lng:-79.76633},
  {name:'Brantford',lat:43.1334,lng:-80.26636},
  {name:'Burlington',lat:43.38621,lng:-79.83713},
  {name:'Cambridge',lat:43.3601,lng:-80.31269},
  {name:'Guelph',lat:43.54594,lng:-80.25599},
  {name:'Hamilton',lat:43.25011,lng:-79.84963},
  {name:'Kingston',lat:44.22976,lng:-76.48098},
  {name:'Kitchener',lat:43.42537,lng:-80.5112},
  {name:'London',lat:42.98339,lng:-81.23304},
  {name:'Markham',lat:43.86682,lng:-79.2663},
  {name:'Mississauga',lat:43.5789,lng:-79.6583},
  {name:'Niagara Falls',lat:43.10012,lng:-79.06627},
  {name:'Oakville',lat:43.45011,lng:-79.68292},
  {name:'Oshawa',lat:43.90012,lng:-78.84957},
  {name:'Ottawa',lat:45.41117,lng:-75.69812},
  {name:'Peterborough',lat:44.30012,lng:-78.31623},
  {name:'St. Catharines',lat:43.17126,lng:-79.24267},
  {name:'Thunder Bay',lat:48.38202,lng:-89.25018},
  {name:'Toronto',lat:43.70643,lng:-79.39864},
  {name:'Vaughan',lat:43.8361,lng:-79.49827},
  {name:'Waterloo',lat:43.4668,lng:-80.51639},
  {name:'Windsor',lat:42.30008,lng:-83.01654},
];
export function cityLocation(city:string):SearchLocation{
  const match=ontarioCities.find(c=>c.name.toLowerCase()===city.toLowerCase());
  const point=match??ontarioCities.find(c=>c.name==='Burlington')!;
  return {lat:point.lat,lng:point.lng,city:point.name,custom:false};
}
