// Aisle product taxonomy.
//
// Three levels, the way a shopper actually looks for something:
//   Department (Produce) → Aisle (Fruit) → Item (Blueberries)
//
// This file is the single source of truth for the catalogue. `catalog.ts`
// derives its product records from it, the category browser navigates it, and
// `tools/generate-product-art.mjs` reads the `art` field to draw one 256px
// illustration per item, so a new item here is never left without a picture.
//
// `edible: false` marks the non-grocery departments. Dietary preferences and
// ingredient restrictions must not suppress toilet paper.

export type ArtSpec = {template:string;colour:string;accent:string};
export type CatalogueItem = {
 id:string;name:string;brand:string;size:string;
 departmentId:string;department:string;aisleId:string;aisle:string;
 art:ArtSpec;base:number;keywords:string;edible:boolean;
};
export type Aisle = {id:string;name:string;departmentId:string;items:CatalogueItem[]};
export type Department = {id:string;name:string;edible:boolean;aisles:Aisle[]};

export const DEPARTMENTS:Department[] = [
 {id:'produce',name:'Produce',edible:true,aisles:[
  {id:'fruit',name:'Fruit',departmentId:'produce',items:[
   {id:'apples',name:'Gala apples',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#d6453f',accent:'#7fa650'},base:449,keywords:'gala apple fruit',edible:true},
   {id:'granny-smith',name:'Granny Smith apples',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#7fae43',accent:'#5d8a33'},base:479,keywords:'green apple tart baking',edible:true},
   {id:'bananas',name:'Bananas',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'banana',colour:'#e8c44a',accent:'#c9a233'},base:169,keywords:'banana',edible:true},
   {id:'blueberries',name:'Blueberries',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'berry',colour:'#4a5fa5',accent:'#2f3f74'},base:549,keywords:'blueberry berries',edible:true},
   {id:'strawberries',name:'Fresh strawberries',brand:'Fresh produce',size:'454 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'strawberry',colour:'#d6423f',accent:'#6f9f4a'},base:499,keywords:'strawberry berries',edible:true},
   {id:'raspberries',name:'Raspberries',brand:'Fresh produce',size:'170 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'berry',colour:'#c23f5c',accent:'#8c2a41'},base:499,keywords:'raspberry berries',edible:true},
   {id:'blackberries',name:'Blackberries',brand:'Fresh produce',size:'170 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'berry',colour:'#3d2b4d',accent:'#241a2e'},base:499,keywords:'blackberry berries',edible:true},
   {id:'grapes-red',name:'Red seedless grapes',brand:'Fresh produce',size:'908 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'grapes',colour:'#8d3f63',accent:'#5f2a43'},base:699,keywords:'grape grapes red',edible:true},
   {id:'grapes-green',name:'Green seedless grapes',brand:'Fresh produce',size:'908 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'grapes',colour:'#a8bf5c',accent:'#7e9440'},base:699,keywords:'grape grapes green',edible:true},
   {id:'oranges',name:'Navel oranges',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'citrus',colour:'#e08334',accent:'#b8621f'},base:549,keywords:'orange citrus',edible:true},
   {id:'clementines',name:'Clementines',brand:'Fresh produce',size:'2 lb box',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'citrus',colour:'#e08f3a',accent:'#bb6a22'},base:599,keywords:'clementine mandarin citrus',edible:true},
   {id:'lemons',name:'Lemons',brand:'Fresh produce',size:'Bag of 4',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'citrus',colour:'#e4c64a',accent:'#bda22f'},base:299,keywords:'lemon citrus',edible:true},
   {id:'limes',name:'Limes',brand:'Fresh produce',size:'Bag of 5',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'citrus',colour:'#7fae43',accent:'#5d8a33'},base:299,keywords:'lime citrus',edible:true},
   {id:'grapefruit',name:'Ruby grapefruit',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'citrus',colour:'#d9705f',accent:'#ab4c3d'},base:149,keywords:'grapefruit citrus',edible:true},
   {id:'pears',name:'Bartlett pears',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'pear',colour:'#b9bf52',accent:'#8d9339'},base:449,keywords:'pear',edible:true},
   {id:'peaches',name:'Peaches',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#e09153',accent:'#b9693a'},base:499,keywords:'peach stone fruit',edible:true},
   {id:'plums',name:'Black plums',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#6a3f63',accent:'#452741'},base:449,keywords:'plum stone fruit',edible:true},
   {id:'nectarines',name:'Nectarines',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#d9713f',accent:'#a94f26'},base:499,keywords:'nectarine stone fruit',edible:true},
   {id:'mangoes',name:'Mangoes',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#e0a03a',accent:'#b06f28'},base:199,keywords:'mango tropical',edible:true},
   {id:'pineapple',name:'Pineapple',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'pineapple',colour:'#deb43f',accent:'#6f9f4a'},base:399,keywords:'pineapple tropical',edible:true},
   {id:'kiwi',name:'Kiwifruit',brand:'Fresh produce',size:'Pack of 4',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#8a7141',accent:'#5f4c2b'},base:349,keywords:'kiwi tropical',edible:true},
   {id:'avocados',name:'Avocados',brand:'Fresh produce',size:'Bag of 5',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'avocado',colour:'#4f6b35',accent:'#c9c063'},base:499,keywords:'avocado',edible:true},
   {id:'watermelon',name:'Seedless watermelon',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'melon',colour:'#cf3f4a',accent:'#4f7a3f'},base:699,keywords:'watermelon melon',edible:true},
   {id:'cantaloupe',name:'Cantaloupe',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'melon',colour:'#e0a05e',accent:'#9fae63'},base:499,keywords:'cantaloupe melon',edible:true},
   {id:'cranberries-fresh',name:'Fresh cranberries',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'berry',colour:'#b4303c',accent:'#7f2029'},base:349,keywords:'cranberry berries',edible:true},
   {id:'pomegranate',name:'Pomegranate',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',art:{template:'round',colour:'#b03a44',accent:'#7d252d'},base:349,keywords:'pomegranate',edible:true},
  ]},
  {id:'vegetables',name:'Vegetables',departmentId:'produce',items:[
   {id:'tomatoes',name:'Roma tomatoes',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'round',colour:'#cf4038',accent:'#6f9f4a'},base:249,keywords:'tomato tomatoes roma',edible:true},
   {id:'cherry-tomatoes',name:'Cherry tomatoes',brand:'Fresh produce',size:'pint',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'berry',colour:'#cf4038',accent:'#6f9f4a'},base:399,keywords:'cherry tomato grape tomatoes',edible:true},
   {id:'potatoes',name:'Yellow potatoes',brand:'Fresh produce',size:'5 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#d2ab5e',accent:'#a3803a'},base:449,keywords:'potato potatoes yellow',edible:true},
   {id:'russet-potatoes',name:'Russet potatoes',brand:'Fresh produce',size:'10 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#a8804a',accent:'#7d5c31'},base:599,keywords:'potato russet baking',edible:true},
   {id:'sweet-potatoes',name:'Sweet potatoes',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'root',colour:'#c9703a',accent:'#9a4f24'},base:399,keywords:'sweet potato yam',edible:true},
   {id:'onions',name:'Yellow onions',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#d9b45e',accent:'#a8843a'},base:349,keywords:'onion onions yellow',edible:true},
   {id:'red-onions',name:'Red onions',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#8f4f6b',accent:'#653347'},base:349,keywords:'onion red',edible:true},
   {id:'garlic',name:'Garlic',brand:'Fresh produce',size:'3 bulbs',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#eae3d4',accent:'#c4b89f'},base:249,keywords:'garlic',edible:true},
   {id:'carrots',name:'Carrots',brand:'Fresh produce',size:'2 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'root',colour:'#d97a33',accent:'#a8551c'},base:249,keywords:'carrot carrots',edible:true},
   {id:'celery',name:'Celery',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#9fb356',accent:'#728238'},base:299,keywords:'celery',edible:true},
   {id:'broccoli',name:'Broccoli crowns',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'floret',colour:'#4f7a3f',accent:'#35592a'},base:299,keywords:'broccoli',edible:true},
   {id:'cauliflower',name:'Cauliflower',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'floret',colour:'#e8e4d2',accent:'#b9b39c'},base:399,keywords:'cauliflower',edible:true},
   {id:'spinach',name:'Baby spinach',brand:'Fresh produce',size:'142 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'leafy',colour:'#3f6f3a',accent:'#2a4f27'},base:349,keywords:'spinach greens salad',edible:true},
   {id:'lettuce',name:'Romaine hearts',brand:'Fresh produce',size:'Pack of 3',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'leafy',colour:'#7fa84a',accent:'#5a7f33'},base:399,keywords:'lettuce romaine salad',edible:true},
   {id:'kale',name:'Curly kale',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'leafy',colour:'#37613a',accent:'#244226'},base:299,keywords:'kale greens',edible:true},
   {id:'cabbage',name:'Green cabbage',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'leafy',colour:'#9fbd63',accent:'#75913f'},base:299,keywords:'cabbage',edible:true},
   {id:'cucumber',name:'English cucumber',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#3f7a45',accent:'#2a562f'},base:199,keywords:'cucumber',edible:true},
   {id:'zucchini',name:'Zucchini',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#4f7f3f',accent:'#35592a'},base:349,keywords:'zucchini courgette',edible:true},
   {id:'bell-peppers',name:'Sweet bell peppers',brand:'Fresh produce',size:'Pack of 3',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'pepper',colour:'#cf4038',accent:'#6f9f4a'},base:499,keywords:'pepper peppers bell capsicum',edible:true},
   {id:'green-peppers',name:'Green peppers',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'pepper',colour:'#4f8a3f',accent:'#35632a'},base:149,keywords:'pepper green',edible:true},
   {id:'mushrooms',name:'White mushrooms',brand:'Fresh produce',size:'227 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'mushroom',colour:'#e4dccb',accent:'#a8977c'},base:299,keywords:'mushroom mushrooms',edible:true},
   {id:'cremini',name:'Cremini mushrooms',brand:'Fresh produce',size:'227 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'mushroom',colour:'#9f7d56',accent:'#71563a'},base:349,keywords:'mushroom cremini brown',edible:true},
   {id:'corn',name:'Sweet corn',brand:'Fresh produce',size:'Pack of 4',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'corn',colour:'#e4c44a',accent:'#7fa650'},base:399,keywords:'corn cob',edible:true},
   {id:'green-beans',name:'Green beans',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#5f8f3f',accent:'#42682a'},base:349,keywords:'green beans',edible:true},
   {id:'asparagus',name:'Asparagus',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#6f9349',accent:'#4d6a31'},base:499,keywords:'asparagus',edible:true},
   {id:'brussels-sprouts',name:'Brussels sprouts',brand:'Fresh produce',size:'454 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'floret',colour:'#5f8a3f',accent:'#42632a'},base:449,keywords:'brussels sprouts',edible:true},
   {id:'eggplant',name:'Eggplant',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#5a3f6b',accent:'#3c2847'},base:299,keywords:'eggplant aubergine',edible:true},
   {id:'squash',name:'Butternut squash',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'root',colour:'#d9a05e',accent:'#a8743a'},base:399,keywords:'squash butternut',edible:true},
   {id:'beets',name:'Beets',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'root',colour:'#8f3350',accent:'#5f1f34'},base:299,keywords:'beet beets beetroot',edible:true},
   {id:'turnip',name:'Turnip',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'bulb',colour:'#c9b8a8',accent:'#9a8878'},base:249,keywords:'turnip rutabaga',edible:true},
   {id:'ginger',name:'Fresh ginger',brand:'Fresh produce',size:'200 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'root',colour:'#d2b47f',accent:'#a38553'},base:249,keywords:'ginger root',edible:true},
   {id:'leeks',name:'Leeks',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',art:{template:'longveg',colour:'#9fbd63',accent:'#e8e8d4'},base:349,keywords:'leek leeks',edible:true},
  ]},
  {id:'herbs',name:'Fresh herbs',departmentId:'produce',items:[
   {id:'basil',name:'Fresh basil',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'herb',colour:'#4f8a3f',accent:'#35632a'},base:299,keywords:'basil herb',edible:true},
   {id:'cilantro',name:'Fresh cilantro',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'herb',colour:'#5f9349',accent:'#426a31'},base:199,keywords:'cilantro coriander herb',edible:true},
   {id:'parsley',name:'Fresh parsley',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'herb',colour:'#3f7a3f',accent:'#2a562a'},base:199,keywords:'parsley herb',edible:true},
   {id:'green-onions',name:'Green onions',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'longveg',colour:'#7fa84a',accent:'#e8e8d4'},base:149,keywords:'green onion scallion spring',edible:true},
   {id:'mint',name:'Fresh mint',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'herb',colour:'#4f9359',accent:'#356a3d'},base:249,keywords:'mint herb',edible:true},
   {id:'rosemary',name:'Fresh rosemary',brand:'Fresh produce',size:'Pack',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',art:{template:'herb',colour:'#4f7a5a',accent:'#35563e'},base:299,keywords:'rosemary herb',edible:true},
  ]},
  {id:'salads',name:'Packaged salads',departmentId:'produce',items:[
   {id:'spring-mix',name:'Spring mix',brand:'Fresh produce',size:'142 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',art:{template:'bag',colour:'#5f8a3f',accent:'#e8e8d4'},base:449,keywords:'salad greens mix',edible:true},
   {id:'caesar-kit',name:'Caesar salad kit',brand:'Fresh produce',size:'300 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',art:{template:'bag',colour:'#7fa84a',accent:'#e8e4d2'},base:499,keywords:'salad kit caesar',edible:true},
   {id:'coleslaw',name:'Coleslaw mix',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',art:{template:'bag',colour:'#9fbd63',accent:'#e8e8d4'},base:299,keywords:'coleslaw slaw cabbage',edible:true},
   {id:'veg-tray',name:'Vegetable tray',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',art:{template:'tray',colour:'#d97a33',accent:'#e8e4d2'},base:799,keywords:'veggie tray platter',edible:true},
  ]},
 ]},
 {id:'dairy',name:'Dairy & eggs',edible:true,aisles:[
  {id:'milk-aisle',name:'Milk',departmentId:'dairy',items:[
   {id:'milk',name:'2% milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'jug',colour:'#f2f4f0',accent:'#4f7fbd'},base:679,keywords:'milk 2%',edible:true},
   {id:'milk-store',name:'2% milk',brand:'Store brand',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'jug',colour:'#f2f4f0',accent:'#4f7fbd'},base:599,keywords:'milk 2% store brand',edible:true},
   {id:'milk-whole',name:'Homogenized milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'jug',colour:'#f2f4f0',accent:'#3f5f9f'},base:699,keywords:'milk whole homo 3.25%',edible:true},
   {id:'milk-skim',name:'Skim milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'jug',colour:'#f2f4f0',accent:'#7f9fbd'},base:679,keywords:'milk skim fat free',edible:true},
   {id:'milk-choc',name:'Chocolate milk',brand:'Neilson',size:'1 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'carton',colour:'#8a5f3f',accent:'#5f3f28'},base:349,keywords:'chocolate milk',edible:true},
   {id:'lactose-free',name:'Lactose-free milk',brand:'Natrel',size:'2 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',art:{template:'carton',colour:'#f2f4f0',accent:'#5fae9f'},base:549,keywords:'lactose free milk',edible:true},
  ]},
  {id:'cheese-aisle',name:'Cheese',departmentId:'dairy',items:[
   {id:'cheese',name:'Old cheddar',brand:'Black Diamond',size:'400 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'cheese',colour:'#e0a53f',accent:'#b87f28'},base:649,keywords:'cheese cheddar old',edible:true},
   {id:'cheese-mild',name:'Mild cheddar',brand:'Black Diamond',size:'400 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'cheese',colour:'#e8b85e',accent:'#bf8f3a'},base:649,keywords:'cheese cheddar mild',edible:true},
   {id:'mozzarella',name:'Mozzarella',brand:'Saputo',size:'320 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'cheese',colour:'#f2ece0',accent:'#cfc4ac'},base:599,keywords:'cheese mozzarella',edible:true},
   {id:'shredded-cheese',name:'Shredded cheese blend',brand:'Armstrong',size:'320 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'bag',colour:'#e0a53f',accent:'#f2ece0'},base:649,keywords:'cheese shredded pizza',edible:true},
   {id:'parmesan',name:'Grated parmesan',brand:'Kraft',size:'250 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'jar',colour:'#eae0c4',accent:'#b9a87f'},base:699,keywords:'cheese parmesan grated',edible:true},
   {id:'cream-cheese',name:'Cream cheese',brand:'Philadelphia',size:'250 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'tub',colour:'#f2f4f0',accent:'#5f7fae'},base:499,keywords:'cream cheese spread',edible:true},
   {id:'feta',name:'Feta cheese',brand:'Krinos',size:'200 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'tub',colour:'#f4f4ee',accent:'#7f9fbd'},base:599,keywords:'cheese feta',edible:true},
   {id:'swiss',name:'Swiss cheese slices',brand:'Black Diamond',size:'240 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'deli',colour:'#eddfa8',accent:'#c9b877'},base:599,keywords:'cheese swiss slices',edible:true},
   {id:'cottage-cheese',name:'Cottage cheese',brand:'Sealtest',size:'500 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',art:{template:'tub',colour:'#f4f4ee',accent:'#5f9fbd'},base:499,keywords:'cottage cheese',edible:true},
  ]},
  {id:'yogurt-aisle',name:'Yogurt',departmentId:'dairy',items:[
   {id:'yogurt',name:'Vanilla Greek yogurt',brand:'Oikos',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'tub',colour:'#f2ece0',accent:'#5f7fae'},base:649,keywords:'yogurt greek vanilla',edible:true},
   {id:'yogurt-store',name:'Vanilla Greek yogurt',brand:'Store brand',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'tub',colour:'#f2ece0',accent:'#5f7fae'},base:479,keywords:'yogurt greek vanilla store',edible:true},
   {id:'yogurt-plain',name:'Plain yogurt',brand:'Astro',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'tub',colour:'#f4f4ee',accent:'#7f9fbd'},base:499,keywords:'yogurt plain natural',edible:true},
   {id:'yogurt-tubes',name:'Yogurt tubes',brand:'Yoplait',size:'8 × 60 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'box',colour:'#d95f8a',accent:'#f2ece0'},base:499,keywords:'yogurt tubes kids',edible:true},
   {id:'skyr',name:'Icelandic skyr',brand:'Ísey',size:'500 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'tub',colour:'#f4f4ee',accent:'#3f6fae'},base:599,keywords:'skyr yogurt protein',edible:true},
   {id:'kefir',name:'Plain kefir',brand:'Liberté',size:'1 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',art:{template:'carton',colour:'#f2f4f0',accent:'#8f9fbd'},base:549,keywords:'kefir drinkable yogurt',edible:true},
  ]},
  {id:'butter-aisle',name:'Butter & margarine',departmentId:'dairy',items:[
   {id:'butter',name:'Salted butter',brand:'Lactantia',size:'454 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',art:{template:'bar',colour:'#e8c44a',accent:'#f2ece0'},base:649,keywords:'butter salted',edible:true},
   {id:'butter-unsalted',name:'Unsalted butter',brand:'Lactantia',size:'454 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',art:{template:'bar',colour:'#edd07f',accent:'#f2ece0'},base:649,keywords:'butter unsalted baking',edible:true},
   {id:'margarine',name:'Soft margarine',brand:'Becel',size:'907 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',art:{template:'tub',colour:'#e8c44a',accent:'#5fae5f'},base:599,keywords:'margarine becel spread',edible:true},
  ]},
  {id:'eggs-aisle',name:'Eggs',departmentId:'dairy',items:[
   {id:'eggs',name:'Large eggs',brand:'Burnbrae Farms',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',art:{template:'egg',colour:'#e8dcc4',accent:'#c4b394'},base:429,keywords:'eggs large dozen',edible:true},
   {id:'eggs-store',name:'Large eggs',brand:'Store brand',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',art:{template:'egg',colour:'#e8dcc4',accent:'#c4b394'},base:369,keywords:'eggs large dozen store',edible:true},
   {id:'eggs-free-run',name:'Free-run eggs',brand:'Burnbrae Farms',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',art:{template:'egg',colour:'#d9bd8f',accent:'#ae9468'},base:599,keywords:'eggs free run',edible:true},
   {id:'egg-whites',name:'Liquid egg whites',brand:'Naturegg',size:'500 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',art:{template:'carton',colour:'#f2f4f0',accent:'#e8c44a'},base:549,keywords:'egg whites liquid',edible:true},
  ]},
  {id:'cream-aisle',name:'Cream & sour cream',departmentId:'dairy',items:[
   {id:'cream-35',name:'Whipping cream 35%',brand:'Lactantia',size:'473 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',art:{template:'carton',colour:'#f2f4f0',accent:'#3f6fae'},base:499,keywords:'cream whipping heavy 35',edible:true},
   {id:'half-and-half',name:'Half and half 10%',brand:'Lactantia',size:'473 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',art:{template:'carton',colour:'#f2f4f0',accent:'#7f9fbd'},base:349,keywords:'cream half coffee 10',edible:true},
   {id:'sour-cream',name:'Sour cream',brand:'Sealtest',size:'500 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',art:{template:'tub',colour:'#f4f4ee',accent:'#3f7fae'},base:399,keywords:'sour cream',edible:true},
  ]},
  {id:'alternatives',name:'Dairy alternatives',departmentId:'dairy',items:[
   {id:'oat-milk',name:'Original oat beverage',brand:'Earth’s Own',size:'1.75 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',art:{template:'carton',colour:'#e4d4b4',accent:'#8a6f4a'},base:449,keywords:'oat milk beverage',edible:true},
   {id:'almond-milk',name:'Unsweetened almond beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',art:{template:'carton',colour:'#e0d2bd',accent:'#7f6144'},base:449,keywords:'almond milk beverage',edible:true},
   {id:'soy-milk',name:'Original soy beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',art:{template:'carton',colour:'#eae0c4',accent:'#a8873f'},base:449,keywords:'soy milk beverage',edible:true},
   {id:'coconut-milk-bev',name:'Coconut beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',art:{template:'carton',colour:'#f2f4f0',accent:'#8fb3bd'},base:449,keywords:'coconut milk beverage',edible:true},
   {id:'vegan-cheese',name:'Plant-based cheese shreds',brand:'Daiya',size:'200 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',art:{template:'bag',colour:'#e0a53f',accent:'#7fa650'},base:599,keywords:'vegan cheese dairy free',edible:true},
  ]},
 ]},
 {id:'meat',name:'Meat & protein',edible:true,aisles:[
  {id:'poultry',name:'Chicken & turkey',departmentId:'meat',items:[
   {id:'chicken',name:'Chicken breasts',brand:'Fresh, boneless',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'poultry',colour:'#eddcc4',accent:'#c9ac8a'},base:1499,keywords:'chicken breast boneless',edible:true},
   {id:'chicken-thighs',name:'Chicken thighs',brand:'Fresh, boneless',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'poultry',colour:'#e0c9a8',accent:'#b39572'},base:1199,keywords:'chicken thighs',edible:true},
   {id:'chicken-drumsticks',name:'Chicken drumsticks',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'poultry',colour:'#e8d2b4',accent:'#a8875f'},base:799,keywords:'chicken drumsticks legs',edible:true},
   {id:'whole-chicken',name:'Whole chicken',brand:'Fresh',size:'1.5 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'poultry',colour:'#eddcc4',accent:'#bd9d78'},base:1099,keywords:'chicken whole roasting',edible:true},
   {id:'ground-chicken',name:'Ground chicken',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'tray',colour:'#e0bfa8',accent:'#f2ece0'},base:799,keywords:'ground chicken mince',edible:true},
   {id:'ground-turkey',name:'Ground turkey',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'tray',colour:'#d9b89f',accent:'#f2ece0'},base:849,keywords:'ground turkey mince',edible:true},
   {id:'chicken-wings',name:'Chicken wings',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',art:{template:'poultry',colour:'#e8d2b4',accent:'#b39572'},base:1299,keywords:'chicken wings',edible:true},
  ]},
  {id:'beef-aisle',name:'Beef',departmentId:'meat',items:[
   {id:'beef',name:'Lean ground beef',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'tray',colour:'#a8423f',accent:'#f2ece0'},base:699,keywords:'ground beef mince lean',edible:true},
   {id:'beef-extra-lean',name:'Extra lean ground beef',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'tray',colour:'#b34a44',accent:'#f2ece0'},base:799,keywords:'ground beef extra lean',edible:true},
   {id:'striploin',name:'Striploin steak',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'steak',colour:'#a03f3f',accent:'#e8d2c4'},base:1599,keywords:'steak striploin beef',edible:true},
   {id:'ribeye',name:'Ribeye steak',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'steak',colour:'#963a3a',accent:'#e8d2c4'},base:1899,keywords:'steak ribeye beef',edible:true},
   {id:'stewing-beef',name:'Stewing beef',brand:'Fresh',size:'700 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'tray',colour:'#94383a',accent:'#f2ece0'},base:1199,keywords:'stewing beef cubes stew',edible:true},
   {id:'beef-roast',name:'Beef roast',brand:'Fresh',size:'1.2 kg',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',art:{template:'steak',colour:'#8f3838',accent:'#e0c4b4'},base:1799,keywords:'roast beef',edible:true},
  ]},
  {id:'pork-aisle',name:'Pork',departmentId:'meat',items:[
   {id:'pork-chops',name:'Pork chops',brand:'Fresh',size:'600 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'steak',colour:'#d9a89f',accent:'#e8d2c4'},base:899,keywords:'pork chops',edible:true},
   {id:'pork-tenderloin',name:'Pork tenderloin',brand:'Fresh',size:'700 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'steak',colour:'#cf9f94',accent:'#e8d2c4'},base:1099,keywords:'pork tenderloin',edible:true},
   {id:'ground-pork',name:'Ground pork',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'tray',colour:'#cf9f94',accent:'#f2ece0'},base:699,keywords:'ground pork mince',edible:true},
   {id:'bacon',name:'Bacon',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'bacon',colour:'#a8423f',accent:'#eddcc4'},base:699,keywords:'bacon strips',edible:true},
   {id:'sausages',name:'Breakfast sausages',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'sausage',colour:'#b35f4a',accent:'#8a432f'},base:599,keywords:'sausage sausages breakfast',edible:true},
   {id:'italian-sausage',name:'Italian sausage',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'sausage',colour:'#a8503f',accent:'#7f3a2a'},base:799,keywords:'sausage italian',edible:true},
   {id:'ham-steak',name:'Ham steak',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',art:{template:'steak',colour:'#d9887f',accent:'#e8c4b4'},base:699,keywords:'ham steak',edible:true},
  ]},
  {id:'seafood',name:'Fish & seafood',departmentId:'meat',items:[
   {id:'salmon',name:'Atlantic salmon',brand:'Fresh fillet',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'fillet',colour:'#d9773f',accent:'#e8a87f'},base:1299,keywords:'salmon fillet fish',edible:true},
   {id:'tilapia',name:'Tilapia fillets',brand:'Frozen',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'fillet',colour:'#e0d2bd',accent:'#c4b39f'},base:899,keywords:'tilapia fish fillet',edible:true},
   {id:'cod',name:'Cod fillets',brand:'Frozen',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'fillet',colour:'#eae4d4',accent:'#c9c0ac'},base:999,keywords:'cod fish fillet',edible:true},
   {id:'haddock',name:'Haddock fillets',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'fillet',colour:'#e8e0cf',accent:'#c4b9a3'},base:1099,keywords:'haddock fish',edible:true},
   {id:'shrimp',name:'Raw shrimp',brand:'Frozen',size:'340 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'shrimp',colour:'#e08f7f',accent:'#b35f4a'},base:1199,keywords:'shrimp prawns',edible:true},
   {id:'tuna-steak',name:'Tuna steak',brand:'Frozen',size:'300 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'fillet',colour:'#b3504a',accent:'#d9887f'},base:1299,keywords:'tuna steak fish',edible:true},
   {id:'mussels',name:'Fresh mussels',brand:'Fresh',size:'907 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',art:{template:'shrimp',colour:'#3f3a4a',accent:'#6f5f7f'},base:699,keywords:'mussels shellfish',edible:true},
  ]},
  {id:'deli',name:'Deli & cured',departmentId:'meat',items:[
   {id:'deli-turkey',name:'Sliced turkey breast',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',art:{template:'deli',colour:'#e8d2b4',accent:'#c4a87f'},base:599,keywords:'deli turkey sliced',edible:true},
   {id:'deli-ham',name:'Black forest ham',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',art:{template:'deli',colour:'#d9887f',accent:'#b35f54'},base:599,keywords:'deli ham sliced',edible:true},
   {id:'salami',name:'Genoa salami',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',art:{template:'deli',colour:'#b3504a',accent:'#8a3a34'},base:599,keywords:'salami deli',edible:true},
   {id:'pepperoni',name:'Pepperoni',brand:'Schneiders',size:'250 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',art:{template:'deli',colour:'#a8423f',accent:'#7f2f2a'},base:499,keywords:'pepperoni pizza',edible:true},
   {id:'hot-dogs',name:'Wieners',brand:'Maple Leaf',size:'450 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',art:{template:'sausage',colour:'#c9705f',accent:'#9a4f3f'},base:549,keywords:'hot dogs wieners franks',edible:true},
  ]},
  {id:'plant-protein',name:'Plant-based protein',departmentId:'meat',items:[
   {id:'tofu',name:'Extra firm tofu',brand:'Sunrise',size:'350 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',art:{template:'box',colour:'#eae4d2',accent:'#c4bda3'},base:349,keywords:'tofu soy protein',edible:true},
   {id:'tempeh',name:'Organic tempeh',brand:'Noble Bean',size:'240 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',art:{template:'box',colour:'#c9b48f',accent:'#9a8768'},base:549,keywords:'tempeh soy protein',edible:true},
   {id:'veggie-burgers',name:'Plant-based burgers',brand:'Beyond Meat',size:'2 × 113 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',art:{template:'box',colour:'#a8543f',accent:'#e0c4b4'},base:799,keywords:'veggie burger plant based',edible:true},
   {id:'veggie-ground',name:'Plant-based ground',brand:'Yves',size:'340 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',art:{template:'tray',colour:'#8f5f4a',accent:'#f2ece0'},base:599,keywords:'veggie ground plant based',edible:true},
  ]},
 ]},
 {id:'bakery',name:'Bakery',edible:true,aisles:[
  {id:'bread-aisle',name:'Bread',departmentId:'bakery',items:[
   {id:'bread',name:'Whole wheat bread',brand:'Dempster’s',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#b98f5f',accent:'#8a6741'},base:399,keywords:'bread whole wheat loaf',edible:true},
   {id:'bread-store',name:'Whole wheat bread',brand:'Store brand',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#b98f5f',accent:'#8a6741'},base:249,keywords:'bread whole wheat store',edible:true},
   {id:'white-bread',name:'White bread',brand:'Wonder',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#e0c9a3',accent:'#bda37f'},base:349,keywords:'bread white loaf',edible:true},
   {id:'multigrain-bread',name:'12 grain bread',brand:'Dempster’s',size:'600 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#a8804f',accent:'#7d5c33'},base:449,keywords:'bread multigrain 12 grain',edible:true},
   {id:'sourdough',name:'Sourdough loaf',brand:'In-store bakery',size:'500 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#d2b083',accent:'#a8865f'},base:449,keywords:'bread sourdough',edible:true},
   {id:'rye-bread',name:'Rye bread',brand:'Dimpflmeier',size:'680 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'loaf',colour:'#8f6f4a',accent:'#664e33'},base:449,keywords:'bread rye',edible:true},
   {id:'baguette',name:'French baguette',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',art:{template:'baguette',colour:'#d9b483',accent:'#ae8a5c'},base:299,keywords:'baguette french stick',edible:true},
  ]},
  {id:'buns',name:'Buns & rolls',departmentId:'bakery',items:[
   {id:'hamburger-buns',name:'Hamburger buns',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',art:{template:'bun',colour:'#d2a877',accent:'#a8814f'},base:349,keywords:'buns hamburger',edible:true},
   {id:'hot-dog-buns',name:'Hot dog buns',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',art:{template:'bun',colour:'#d2a877',accent:'#a8814f'},base:349,keywords:'buns hot dog',edible:true},
   {id:'dinner-rolls',name:'Dinner rolls',brand:'In-store bakery',size:'Pack of 12',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',art:{template:'bun',colour:'#dcb686',accent:'#b08d5c'},base:399,keywords:'rolls dinner',edible:true},
   {id:'kaiser-rolls',name:'Kaiser rolls',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',art:{template:'bun',colour:'#d9b483',accent:'#ae8a5c'},base:349,keywords:'rolls kaiser buns',edible:true},
  ]},
  {id:'bagels',name:'Bagels & muffins',departmentId:'bakery',items:[
   {id:'bagels',name:'Plain bagels',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & muffins',art:{template:'bagel',colour:'#d2a877',accent:'#a8814f'},base:399,keywords:'bagels plain',edible:true},
   {id:'everything-bagels',name:'Everything bagels',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & muffins',art:{template:'bagel',colour:'#bd9463',accent:'#8f6f44'},base:399,keywords:'bagels everything',edible:true},
   {id:'english-muffins',name:'English muffins',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & muffins',art:{template:'bun',colour:'#dcbd94',accent:'#b3956c'},base:349,keywords:'english muffins',edible:true},
   {id:'croissants',name:'Butter croissants',brand:'In-store bakery',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & muffins',art:{template:'croissant',colour:'#dcb46f',accent:'#b08c4a'},base:499,keywords:'croissants pastry',edible:true},
  ]},
  {id:'tortillas',name:'Tortillas & flatbread',departmentId:'bakery',items:[
   {id:'tortillas',name:'Flour tortillas',brand:'Old El Paso',size:'10 × 25 cm',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',art:{template:'tortilla',colour:'#e8d9bd',accent:'#c4b394'},base:399,keywords:'tortillas wraps flour',edible:true},
   {id:'whole-wheat-wraps',name:'Whole wheat wraps',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',art:{template:'tortilla',colour:'#c9a87f',accent:'#a08560'},base:399,keywords:'wraps whole wheat tortilla',edible:true},
   {id:'pita',name:'Greek pita',brand:'Kontos',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',art:{template:'tortilla',colour:'#e0cfae',accent:'#bda88a'},base:349,keywords:'pita flatbread',edible:true},
   {id:'naan',name:'Naan bread',brand:'Stonefire',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',art:{template:'tortilla',colour:'#e4d2ae',accent:'#bfa87f'},base:449,keywords:'naan flatbread indian',edible:true},
  ]},
  {id:'sweet-bakery',name:'Sweet bakery',departmentId:'bakery',items:[
   {id:'muffins',name:'Blueberry muffins',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',art:{template:'pastry',colour:'#b98f5f',accent:'#4a5fa5'},base:599,keywords:'muffins blueberry',edible:true},
   {id:'donuts',name:'Assorted donuts',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',art:{template:'pastry',colour:'#d99f6f',accent:'#d9548a'},base:599,keywords:'donuts doughnuts',edible:true},
   {id:'cinnamon-buns',name:'Cinnamon buns',brand:'In-store bakery',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',art:{template:'pastry',colour:'#b98052',accent:'#e8dcc4'},base:549,keywords:'cinnamon buns rolls',edible:true},
   {id:'cake',name:'Vanilla layer cake',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',art:{template:'pastry',colour:'#f2e4cf',accent:'#d9548a'},base:1299,keywords:'cake birthday vanilla',edible:true},
   {id:'apple-pie',name:'Apple pie',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',art:{template:'pastry',colour:'#d9b483',accent:'#c9803f'},base:899,keywords:'pie apple dessert',edible:true},
  ]},
 ]},
 {id:'pantry',name:'Pantry',edible:true,aisles:[
  {id:'pasta-aisle',name:'Pasta & noodles',departmentId:'pantry',items:[
   {id:'pasta',name:'Spaghetti',brand:'Barilla',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'box',colour:'#3f5fa5',accent:'#e8c44a'},base:299,keywords:'pasta spaghetti',edible:true},
   {id:'pasta-store',name:'Spaghetti',brand:'Store brand',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'box',colour:'#3f5fa5',accent:'#e8c44a'},base:169,keywords:'pasta spaghetti store',edible:true},
   {id:'penne',name:'Penne rigate',brand:'Barilla',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'box',colour:'#3f5fa5',accent:'#e8c44a'},base:299,keywords:'pasta penne',edible:true},
   {id:'fusilli',name:'Fusilli',brand:'Catelli',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'box',colour:'#c94f3f',accent:'#e8c44a'},base:299,keywords:'pasta fusilli rotini',edible:true},
   {id:'macaroni',name:'Elbow macaroni',brand:'Catelli',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'bag',colour:'#c94f3f',accent:'#e8c44a'},base:349,keywords:'pasta macaroni elbow',edible:true},
   {id:'lasagna-noodles',name:'Lasagna noodles',brand:'Catelli',size:'375 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'box',colour:'#c94f3f',accent:'#e8c44a'},base:349,keywords:'pasta lasagna noodles',edible:true},
   {id:'egg-noodles',name:'Broad egg noodles',brand:'No Name',size:'340 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'bag',colour:'#e8c44a',accent:'#c9a233'},base:249,keywords:'noodles egg',edible:true},
   {id:'ramen',name:'Instant ramen',brand:'Nissin',size:'5 × 85 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'pouch',colour:'#c94f3f',accent:'#e8c44a'},base:299,keywords:'ramen noodles instant',edible:true},
   {id:'rice-noodles',name:'Rice vermicelli',brand:'Thai Kitchen',size:'200 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',art:{template:'bag',colour:'#eae4d4',accent:'#c4bda3'},base:349,keywords:'rice noodles vermicelli',edible:true},
  ]},
  {id:'rice-grains',name:'Rice & grains',departmentId:'pantry',items:[
   {id:'rice',name:'Jasmine rice',brand:'Rooster',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'bag',colour:'#eae4d4',accent:'#c94f3f'},base:899,keywords:'rice jasmine',edible:true},
   {id:'rice-store',name:'Jasmine rice',brand:'Store brand',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'bag',colour:'#eae4d4',accent:'#c94f3f'},base:649,keywords:'rice jasmine store',edible:true},
   {id:'basmati',name:'Basmati rice',brand:'Dawat',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'bag',colour:'#eae4d4',accent:'#5f8a3f'},base:999,keywords:'rice basmati',edible:true},
   {id:'brown-rice',name:'Long grain brown rice',brand:'Uncle Ben’s',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'box',colour:'#a8804f',accent:'#e8c44a'},base:449,keywords:'rice brown',edible:true},
   {id:'quinoa',name:'White quinoa',brand:'GoGo Quinoa',size:'750 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'bag',colour:'#e4dcc4',accent:'#7fa650'},base:899,keywords:'quinoa grain',edible:true},
   {id:'couscous',name:'Couscous',brand:'Aurora',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'box',colour:'#e8d9bd',accent:'#c9a233'},base:399,keywords:'couscous grain',edible:true},
   {id:'barley',name:'Pearl barley',brand:'No Name',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',art:{template:'bag',colour:'#e0d2ae',accent:'#b39a6f'},base:249,keywords:'barley grain soup',edible:true},
  ]},
  {id:'canned-veg',name:'Canned vegetables & tomatoes',departmentId:'pantry',items:[
   {id:'canned-tomatoes',name:'Diced tomatoes',brand:'Aylmer',size:'796 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:229,keywords:'canned tomatoes diced',edible:true},
   {id:'tomato-paste',name:'Tomato paste',brand:'Hunt’s',size:'156 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#a8322c',accent:'#e8e4d2'},base:129,keywords:'tomato paste',edible:true},
   {id:'crushed-tomatoes',name:'Crushed tomatoes',brand:'Aylmer',size:'796 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#bd3a32',accent:'#e8e4d2'},base:229,keywords:'canned tomatoes crushed',edible:true},
   {id:'canned-corn',name:'Whole kernel corn',brand:'Green Giant',size:'341 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#e8c44a',accent:'#5f8a3f'},base:149,keywords:'canned corn',edible:true},
   {id:'canned-peas',name:'Sweet peas',brand:'Green Giant',size:'398 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#5f8a3f',accent:'#e8e4d2'},base:149,keywords:'canned peas',edible:true},
   {id:'canned-mushrooms',name:'Sliced mushrooms',brand:'Money’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'can',colour:'#a8977c',accent:'#e8e4d2'},base:179,keywords:'canned mushrooms',edible:true},
   {id:'olives',name:'Sliced black olives',brand:'Unico',size:'375 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'jar',colour:'#3f3a3f',accent:'#e8e4d2'},base:299,keywords:'olives black',edible:true},
   {id:'pickles',name:'Dill pickles',brand:'Bick’s',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables & tomatoes',art:{template:'jar',colour:'#7fa650',accent:'#e8e4d2'},base:449,keywords:'pickles dill',edible:true},
  ]},
  {id:'canned-protein',name:'Canned fish & meat',departmentId:'pantry',items:[
   {id:'tuna-canned',name:'Flaked light tuna',brand:'Clover Leaf',size:'170 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',art:{template:'can',colour:'#4f7fbd',accent:'#e8e4d2'},base:199,keywords:'tuna canned',edible:true},
   {id:'salmon-canned',name:'Sockeye salmon',brand:'Clover Leaf',size:'213 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',art:{template:'can',colour:'#d9773f',accent:'#e8e4d2'},base:499,keywords:'salmon canned',edible:true},
   {id:'sardines',name:'Sardines in oil',brand:'Brunswick',size:'106 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',art:{template:'can',colour:'#7f9fbd',accent:'#e8e4d2'},base:179,keywords:'sardines canned',edible:true},
   {id:'canned-chicken',name:'Flaked chicken',brand:'No Name',size:'200 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',art:{template:'can',colour:'#e8d2b4',accent:'#c4a87f'},base:349,keywords:'canned chicken',edible:true},
  ]},
  {id:'beans-aisle',name:'Beans & legumes',departmentId:'pantry',items:[
   {id:'beans',name:'Black beans',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'can',colour:'#3f3a4a',accent:'#e8e4d2'},base:189,keywords:'beans black canned',edible:true},
   {id:'chickpeas',name:'Chickpeas',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'can',colour:'#d9c48f',accent:'#e8e4d2'},base:189,keywords:'chickpeas garbanzo',edible:true},
   {id:'kidney-beans',name:'Red kidney beans',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'can',colour:'#8f3338',accent:'#e8e4d2'},base:189,keywords:'beans kidney red',edible:true},
   {id:'baked-beans',name:'Beans in tomato sauce',brand:'Heinz',size:'398 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:229,keywords:'baked beans',edible:true},
   {id:'lentils',name:'Dry green lentils',brand:'No Name',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'bag',colour:'#7f8a4a',accent:'#e4dcc4'},base:399,keywords:'lentils dry',edible:true},
   {id:'split-peas',name:'Yellow split peas',brand:'No Name',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & legumes',art:{template:'bag',colour:'#e8c44a',accent:'#e4dcc4'},base:349,keywords:'split peas dry',edible:true},
  ]},
  {id:'soup-broth',name:'Soup & broth',departmentId:'pantry',items:[
   {id:'chicken-soup',name:'Chicken noodle soup',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:149,keywords:'soup chicken noodle',edible:true},
   {id:'tomato-soup',name:'Tomato soup',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:149,keywords:'soup tomato',edible:true},
   {id:'mushroom-soup',name:'Cream of mushroom',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:149,keywords:'soup mushroom cream',edible:true},
   {id:'chicken-broth',name:'Chicken broth',brand:'Campbell’s',size:'900 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'carton',colour:'#e8c44a',accent:'#c9a233'},base:299,keywords:'broth stock chicken',edible:true},
   {id:'veg-broth',name:'Vegetable broth',brand:'Imagine',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'carton',colour:'#7fa650',accent:'#5f8a3f'},base:349,keywords:'broth stock vegetable',edible:true},
   {id:'beef-broth',name:'Beef broth',brand:'Campbell’s',size:'900 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',art:{template:'carton',colour:'#8f4f3f',accent:'#6f3a2a'},base:299,keywords:'broth stock beef',edible:true},
  ]},
  {id:'sauces',name:'Cooking sauces',departmentId:'pantry',items:[
   {id:'sauce',name:'Tomato pasta sauce',brand:'Classico',size:'650 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'jar',colour:'#c94038',accent:'#e8e4d2'},base:349,keywords:'pasta sauce tomato marinara',edible:true},
   {id:'alfredo',name:'Alfredo sauce',brand:'Classico',size:'410 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'jar',colour:'#eae4d2',accent:'#c9bd9f'},base:399,keywords:'alfredo sauce white',edible:true},
   {id:'salsa',name:'Medium salsa',brand:'Tostitos',size:'418 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'jar',colour:'#c94038',accent:'#5f8a3f'},base:399,keywords:'salsa dip',edible:true},
   {id:'soy-sauce',name:'Soy sauce',brand:'Kikkoman',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'bottle',colour:'#3f2f28',accent:'#c94038'},base:399,keywords:'soy sauce',edible:true},
   {id:'curry-sauce',name:'Butter chicken sauce',brand:'Patak’s',size:'400 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'jar',colour:'#d9773f',accent:'#b3542a'},base:449,keywords:'curry sauce butter chicken',edible:true},
   {id:'stir-fry-sauce',name:'Stir-fry sauce',brand:'VH',size:'341 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'bottle',colour:'#8f4f2f',accent:'#c9703a'},base:349,keywords:'stir fry sauce',edible:true},
   {id:'pizza-sauce',name:'Pizza sauce',brand:'Unico',size:'213 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:179,keywords:'pizza sauce',edible:true},
  ]},
  {id:'oils',name:'Oils & vinegars',departmentId:'pantry',items:[
   {id:'olive-oil',name:'Extra virgin olive oil',brand:'Bertolli',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'bottle',colour:'#7fa650',accent:'#5f7f33'},base:1399,keywords:'olive oil extra virgin',edible:true},
   {id:'canola-oil',name:'Canola oil',brand:'No Name',size:'3 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'jug',colour:'#e8c44a',accent:'#c9a233'},base:799,keywords:'canola oil vegetable',edible:true},
   {id:'vegetable-oil',name:'Vegetable oil',brand:'Mazola',size:'1.42 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'bottle',colour:'#e8c44a',accent:'#c9a233'},base:599,keywords:'vegetable oil',edible:true},
   {id:'coconut-oil',name:'Coconut oil',brand:'Nutiva',size:'414 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'jar',colour:'#f2ece0',accent:'#cfc4ac'},base:999,keywords:'coconut oil',edible:true},
   {id:'white-vinegar',name:'White vinegar',brand:'Heinz',size:'4 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'jug',colour:'#f2f4f0',accent:'#c94038'},base:499,keywords:'vinegar white cleaning',edible:true},
   {id:'balsamic',name:'Balsamic vinegar',brand:'Colavita',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'bottle',colour:'#3f2a28',accent:'#8f6f4a'},base:599,keywords:'vinegar balsamic',edible:true},
   {id:'cooking-spray',name:'Canola cooking spray',brand:'Pam',size:'170 g',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',art:{template:'spray',colour:'#e8c44a',accent:'#4f6f3f'},base:549,keywords:'cooking spray pam',edible:true},
  ]},
  {id:'spices',name:'Spices & seasonings',departmentId:'pantry',items:[
   {id:'salt',name:'Table salt',brand:'Sifto',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'box',colour:'#f2f4f0',accent:'#3f6fae'},base:199,keywords:'salt',edible:true},
   {id:'pepper',name:'Ground black pepper',brand:'Club House',size:'100 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#3f3a38',accent:'#e8e4d2'},base:449,keywords:'pepper black ground',edible:true},
   {id:'garlic-powder',name:'Garlic powder',brand:'Club House',size:'100 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#e8dcc4',accent:'#c4b394'},base:449,keywords:'garlic powder',edible:true},
   {id:'cinnamon',name:'Ground cinnamon',brand:'Club House',size:'55 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#8f5f3a',accent:'#e8e4d2'},base:399,keywords:'cinnamon ground',edible:true},
   {id:'paprika',name:'Paprika',brand:'Club House',size:'60 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#c94038',accent:'#e8e4d2'},base:399,keywords:'paprika',edible:true},
   {id:'oregano',name:'Dried oregano',brand:'Club House',size:'20 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#5f8a3f',accent:'#e8e4d2'},base:349,keywords:'oregano dried herb',edible:true},
   {id:'chili-powder',name:'Chili powder',brand:'Club House',size:'65 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#a8422c',accent:'#e8e4d2'},base:399,keywords:'chili powder',edible:true},
   {id:'cumin',name:'Ground cumin',brand:'Club House',size:'50 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#a8803f',accent:'#e8e4d2'},base:399,keywords:'cumin ground',edible:true},
   {id:'italian-seasoning',name:'Italian seasoning',brand:'Club House',size:'25 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#5f8a3f',accent:'#e8e4d2'},base:399,keywords:'italian seasoning herbs',edible:true},
   {id:'bay-leaves',name:'Bay leaves',brand:'Club House',size:'5 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',art:{template:'sachet',colour:'#4f7a3f',accent:'#e8e4d2'},base:349,keywords:'bay leaves',edible:true},
  ]},
  {id:'baking',name:'Baking supplies',departmentId:'pantry',items:[
   {id:'flour',name:'All purpose flour',brand:'Robin Hood',size:'2.5 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#f2ece0',accent:'#c94038'},base:549,keywords:'flour all purpose baking',edible:true},
   {id:'whole-wheat-flour',name:'Whole wheat flour',brand:'Robin Hood',size:'2.5 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#d2b483',accent:'#8f6f4a'},base:599,keywords:'flour whole wheat',edible:true},
   {id:'sugar',name:'Granulated sugar',brand:'Redpath',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#f2f4f0',accent:'#c9a233'},base:349,keywords:'sugar white granulated',edible:true},
   {id:'brown-sugar',name:'Brown sugar',brand:'Redpath',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#a8804f',accent:'#e8d2b4'},base:299,keywords:'sugar brown',edible:true},
   {id:'icing-sugar',name:'Icing sugar',brand:'Redpath',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#f4f4ee',accent:'#bdc4cf'},base:299,keywords:'icing sugar powdered',edible:true},
   {id:'baking-soda',name:'Baking soda',brand:'Arm & Hammer',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'box',colour:'#e8c44a',accent:'#3f6fae'},base:249,keywords:'baking soda',edible:true},
   {id:'baking-powder',name:'Baking powder',brand:'Magic',size:'225 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'can',colour:'#c94038',accent:'#e8e4d2'},base:349,keywords:'baking powder',edible:true},
   {id:'vanilla',name:'Pure vanilla extract',brand:'Club House',size:'43 mL',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bottle',colour:'#5f3f28',accent:'#c9a87f'},base:699,keywords:'vanilla extract',edible:true},
   {id:'chocolate-chips',name:'Semi-sweet chocolate chips',brand:'Chipits',size:'300 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'bag',colour:'#4a2f28',accent:'#c9a233'},base:449,keywords:'chocolate chips baking',edible:true},
   {id:'cocoa',name:'Cocoa powder',brand:'Fry’s',size:'227 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'can',colour:'#5f3a28',accent:'#c94038'},base:549,keywords:'cocoa powder baking',edible:true},
   {id:'yeast',name:'Instant yeast',brand:'Fleischmann’s',size:'8 g × 3',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'sachet',colour:'#c94038',accent:'#e8c44a'},base:249,keywords:'yeast bread baking',edible:true},
   {id:'cornstarch',name:'Corn starch',brand:'Canada',size:'454 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',art:{template:'box',colour:'#e8c44a',accent:'#c94038'},base:299,keywords:'cornstarch thickener',edible:true},
  ]},
  {id:'condiments',name:'Condiments',departmentId:'pantry',items:[
   {id:'ketchup',name:'Tomato ketchup',brand:'Heinz',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#c94038',accent:'#e8e4d2'},base:499,keywords:'ketchup',edible:true},
   {id:'mustard',name:'Prepared mustard',brand:'French’s',size:'400 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#e8c44a',accent:'#c94038'},base:299,keywords:'mustard yellow',edible:true},
   {id:'dijon',name:'Dijon mustard',brand:'Maille',size:'215 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'jar',colour:'#d9c48f',accent:'#3f5f7f'},base:399,keywords:'mustard dijon',edible:true},
   {id:'mayonnaise',name:'Real mayonnaise',brand:'Hellmann’s',size:'890 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'jar',colour:'#f2ece0',accent:'#3f5fa5'},base:699,keywords:'mayonnaise mayo',edible:true},
   {id:'relish',name:'Sweet relish',brand:'Bick’s',size:'375 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'jar',colour:'#7fa650',accent:'#e8e4d2'},base:299,keywords:'relish pickle',edible:true},
   {id:'bbq-sauce',name:'Original BBQ sauce',brand:'Bull’s-Eye',size:'425 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#7f3a28',accent:'#c9542f'},base:399,keywords:'bbq sauce barbecue',edible:true},
   {id:'hot-sauce',name:'Hot sauce',brand:'Frank’s RedHot',size:'354 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#c94038',accent:'#e8c44a'},base:449,keywords:'hot sauce',edible:true},
   {id:'ranch',name:'Ranch dressing',brand:'Kraft',size:'475 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#f2ece0',accent:'#5f8a3f'},base:449,keywords:'ranch dressing salad',edible:true},
   {id:'italian-dressing',name:'Italian dressing',brand:'Kraft',size:'475 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',art:{template:'bottle',colour:'#c9a84a',accent:'#5f8a3f'},base:399,keywords:'italian dressing salad',edible:true},
  ]},
  {id:'spreads',name:'Spreads & sweeteners',departmentId:'pantry',items:[
   {id:'peanut-butter',name:'Peanut butter',brand:'Kraft',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'jar',colour:'#b3803f',accent:'#3f5fa5'},base:649,keywords:'peanut butter',edible:true},
   {id:'almond-butter',name:'Almond butter',brand:'Kirkland',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'jar',colour:'#a8804f',accent:'#7f6144'},base:1299,keywords:'almond butter',edible:true},
   {id:'nutella',name:'Hazelnut spread',brand:'Nutella',size:'725 g',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'jar',colour:'#5f3a28',accent:'#e8e4d2'},base:699,keywords:'nutella hazelnut chocolate spread',edible:true},
   {id:'jam',name:'Strawberry jam',brand:'Smucker’s',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'jar',colour:'#c9423f',accent:'#e8e4d2'},base:449,keywords:'jam jelly strawberry',edible:true},
   {id:'honey',name:'Liquid honey',brand:'Billy Bee',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'jar',colour:'#d9a03a',accent:'#b37f28'},base:999,keywords:'honey',edible:true},
   {id:'maple-syrup',name:'Pure maple syrup',brand:'Kirkland',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',art:{template:'bottle',colour:'#8f5f28',accent:'#c9873a'},base:1499,keywords:'maple syrup',edible:true},
  ]},
 ]},
 {id:'breakfast',name:'Breakfast',edible:true,aisles:[
  {id:'cereal-aisle',name:'Cereal',departmentId:'breakfast',items:[
   {id:'cereal',name:'Original Cheerios',brand:'General Mills',size:'350 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'box',colour:'#e8c44a',accent:'#f2ece0'},base:549,keywords:'cereal cheerios oats',edible:true},
   {id:'corn-flakes',name:'Corn Flakes',brand:'Kellogg’s',size:'525 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:549,keywords:'cereal corn flakes',edible:true},
   {id:'raisin-bran',name:'Raisin Bran',brand:'Kellogg’s',size:'425 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'box',colour:'#7f4f8a',accent:'#e8c44a'},base:549,keywords:'cereal raisin bran',edible:true},
   {id:'mini-wheats',name:'Mini-Wheats',brand:'Kellogg’s',size:'510 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'box',colour:'#c94038',accent:'#e8d2b4'},base:599,keywords:'cereal mini wheats',edible:true},
   {id:'granola',name:'Vanilla almond granola',brand:'Nature’s Path',size:'325 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'bag',colour:'#b98f5f',accent:'#e8dcc4'},base:649,keywords:'granola cereal',edible:true},
   {id:'kids-cereal',name:'Froot Loops',brand:'Kellogg’s',size:'345 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',art:{template:'box',colour:'#5fae9f',accent:'#e8c44a'},base:599,keywords:'cereal kids froot loops',edible:true},
  ]},
  {id:'hot-cereal',name:'Hot cereal',departmentId:'breakfast',items:[
   {id:'oats',name:'Quick oats',brand:'Quaker',size:'1 kg',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',art:{template:'box',colour:'#c94038',accent:'#e8dcc4'},base:499,keywords:'oats oatmeal quick',edible:true},
   {id:'steel-cut-oats',name:'Steel cut oats',brand:'Bob’s Red Mill',size:'680 g',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',art:{template:'bag',colour:'#c94038',accent:'#e8dcc4'},base:699,keywords:'oats steel cut',edible:true},
   {id:'instant-oatmeal',name:'Instant oatmeal',brand:'Quaker',size:'8 × 43 g',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:499,keywords:'oatmeal instant packets',edible:true},
   {id:'cream-of-wheat',name:'Cream of wheat',brand:'Cream of Wheat',size:'1 kg',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',art:{template:'box',colour:'#c94038',accent:'#f2ece0'},base:599,keywords:'cream of wheat porridge',edible:true},
  ]},
  {id:'breakfast-extras',name:'Syrups & breakfast',departmentId:'breakfast',items:[
   {id:'pancake-mix',name:'Pancake mix',brand:'Aunt Jemima',size:'905 g',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',art:{template:'box',colour:'#e8c44a',accent:'#c9703a'},base:499,keywords:'pancake waffle mix',edible:true},
   {id:'table-syrup',name:'Table syrup',brand:'Aunt Jemima',size:'750 mL',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',art:{template:'bottle',colour:'#8f5f28',accent:'#c9873a'},base:499,keywords:'syrup pancake',edible:true},
   {id:'breakfast-bars',name:'Chewy granola bars',brand:'Quaker',size:'8 bars',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:449,keywords:'granola bars breakfast',edible:true},
   {id:'toaster-pastries',name:'Toaster pastries',brand:'Pop-Tarts',size:'8 pastries',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',art:{template:'box',colour:'#5f7fbd',accent:'#e8c44a'},base:549,keywords:'pop tarts toaster pastries',edible:true},
  ]},
 ]},
 {id:'snacks',name:'Snacks',edible:true,aisles:[
  {id:'chips',name:'Chips & savoury',departmentId:'snacks',items:[
   {id:'potato-chips',name:'Original potato chips',brand:'Lay’s',size:'235 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#e8c44a',accent:'#c94038'},base:449,keywords:'chips potato',edible:true},
   {id:'ketchup-chips',name:'Ketchup chips',brand:'Lay’s',size:'235 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#c94038',accent:'#e8c44a'},base:449,keywords:'chips ketchup',edible:true},
   {id:'tortilla-chips',name:'Tortilla chips',brand:'Tostitos',size:'295 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#e8c44a',accent:'#5f8a3f'},base:499,keywords:'tortilla chips nachos',edible:true},
   {id:'cheese-puffs',name:'Cheese puffs',brand:'Cheetos',size:'310 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#e8943a',accent:'#c94038'},base:499,keywords:'cheese puffs cheetos',edible:true},
   {id:'pretzels',name:'Salted pretzels',brand:'Rold Gold',size:'350 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#a8804f',accent:'#c94038'},base:399,keywords:'pretzels',edible:true},
   {id:'popcorn',name:'Microwave popcorn',brand:'Orville',size:'3 × 82 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'box',colour:'#e8c44a',accent:'#c94038'},base:399,keywords:'popcorn microwave',edible:true},
   {id:'veggie-chips',name:'Veggie straws',brand:'Sensible Portions',size:'220 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',art:{template:'bag',colour:'#7fa650',accent:'#e8943a'},base:499,keywords:'veggie straws chips',edible:true},
  ]},
  {id:'crackers',name:'Crackers',departmentId:'snacks',items:[
   {id:'crackers',name:'Original crackers',brand:'Ritz',size:'200 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:349,keywords:'crackers ritz',edible:true},
   {id:'soda-crackers',name:'Premium Plus crackers',brand:'Christie',size:'450 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',art:{template:'box',colour:'#3f5fa5',accent:'#f2ece0'},base:399,keywords:'crackers soda saltine',edible:true},
   {id:'triscuits',name:'Woven wheat crackers',brand:'Triscuit',size:'200 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',art:{template:'box',colour:'#8f6f3a',accent:'#e8dcc4'},base:399,keywords:'crackers triscuit wheat',edible:true},
   {id:'rice-cakes',name:'Lightly salted rice cakes',brand:'Quaker',size:'199 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',art:{template:'bag',colour:'#eae4d4',accent:'#c94038'},base:349,keywords:'rice cakes',edible:true},
  ]},
  {id:'nuts',name:'Nuts & seeds',departmentId:'snacks',items:[
   {id:'peanuts',name:'Salted peanuts',brand:'Planters',size:'600 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'jar',colour:'#3f5fa5',accent:'#c9a233'},base:699,keywords:'peanuts nuts',edible:true},
   {id:'almonds',name:'Roasted almonds',brand:'Kirkland',size:'1.13 kg',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'bag',colour:'#8f6f4a',accent:'#e8dcc4'},base:1499,keywords:'almonds nuts',edible:true},
   {id:'cashews',name:'Whole cashews',brand:'Planters',size:'275 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'jar',colour:'#e8dcc4',accent:'#c4b394'},base:899,keywords:'cashews nuts',edible:true},
   {id:'mixed-nuts',name:'Mixed nuts',brand:'Planters',size:'600 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'jar',colour:'#3f5fa5',accent:'#a8804f'},base:999,keywords:'mixed nuts',edible:true},
   {id:'sunflower-seeds',name:'Sunflower seeds',brand:'Spitz',size:'210 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'bag',colour:'#3f3a38',accent:'#e8c44a'},base:349,keywords:'sunflower seeds',edible:true},
   {id:'trail-mix',name:'Trail mix',brand:'Kirkland',size:'1 kg',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',art:{template:'bag',colour:'#a8804f',accent:'#c94038'},base:1299,keywords:'trail mix nuts',edible:true},
  ]},
  {id:'cookies',name:'Cookies & biscuits',departmentId:'snacks',items:[
   {id:'cookies',name:'Chocolate chip cookies',brand:'Chips Ahoy!',size:'300 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',art:{template:'box',colour:'#3f5fa5',accent:'#8f5f3a'},base:399,keywords:'cookies chocolate chip',edible:true},
   {id:'oreos',name:'Sandwich cookies',brand:'Oreo',size:'303 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',art:{template:'box',colour:'#2f3f6f',accent:'#f2ece0'},base:449,keywords:'cookies oreo sandwich',edible:true},
   {id:'digestives',name:'Digestive biscuits',brand:'Peek Freans',size:'400 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',art:{template:'box',colour:'#c94038',accent:'#d2a877'},base:399,keywords:'biscuits digestive',edible:true},
   {id:'fig-bars',name:'Fruit bars',brand:'Nature Valley',size:'5 bars',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',art:{template:'box',colour:'#7fa650',accent:'#e8c44a'},base:399,keywords:'fig bars fruit',edible:true},
  ]},
  {id:'candy',name:'Chocolate & candy',departmentId:'snacks',items:[
   {id:'chocolate-bar',name:'Milk chocolate bar',brand:'Cadbury',size:'100 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',art:{template:'bar',colour:'#5f3f7f',accent:'#8f6f3a'},base:279,keywords:'chocolate bar cadbury',edible:true},
   {id:'dark-chocolate',name:'Dark chocolate',brand:'Lindt',size:'100 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',art:{template:'bar',colour:'#3f2a28',accent:'#c9a233'},base:449,keywords:'chocolate dark',edible:true},
   {id:'gummy-candy',name:'Gummy bears',brand:'Haribo',size:'175 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',art:{template:'bag',colour:'#e8c44a',accent:'#c94038'},base:299,keywords:'gummy candy bears',edible:true},
   {id:'chocolate-multipack',name:'Chocolate multipack',brand:'Nestlé',size:'10 bars',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',art:{template:'box',colour:'#c94038',accent:'#8f5f3a'},base:699,keywords:'chocolate multipack',edible:true},
   {id:'mints',name:'Peppermints',brand:'Life Savers',size:'150 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',art:{template:'bag',colour:'#f2f4f0',accent:'#4fae9f'},base:299,keywords:'mints candy',edible:true},
  ]},
  {id:'dried-fruit',name:'Dried fruit & bars',departmentId:'snacks',items:[
   {id:'raisins',name:'Sultana raisins',brand:'Sun-Maid',size:'750 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',art:{template:'box',colour:'#5f3a4a',accent:'#c94038'},base:599,keywords:'raisins dried fruit',edible:true},
   {id:'dried-cranberries',name:'Dried cranberries',brand:'Ocean Spray',size:'340 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',art:{template:'bag',colour:'#b4303c',accent:'#e8e4d2'},base:449,keywords:'dried cranberries craisins',edible:true},
   {id:'dates',name:'Medjool dates',brand:'Kirkland',size:'1 kg',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',art:{template:'box',colour:'#7f4f2f',accent:'#c9a87f'},base:1299,keywords:'dates dried fruit',edible:true},
   {id:'protein-bars',name:'Protein bars',brand:'Clif',size:'6 bars',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',art:{template:'box',colour:'#c94038',accent:'#7fa650'},base:899,keywords:'protein bars energy',edible:true},
   {id:'fruit-snacks',name:'Fruit snacks',brand:'Welch’s',size:'10 pouches',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',art:{template:'box',colour:'#7f3f8a',accent:'#e8c44a'},base:499,keywords:'fruit snacks gummies kids',edible:true},
  ]},
 ]},
 {id:'frozen',name:'Frozen',edible:true,aisles:[
  {id:'frozen-veg',name:'Frozen vegetables',departmentId:'frozen',items:[
   {id:'peas',name:'Frozen green peas',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#5f8a3f',accent:'#e8e4d2'},base:349,keywords:'frozen peas',edible:true},
   {id:'frozen-corn',name:'Frozen corn',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#e8c44a',accent:'#5f8a3f'},base:349,keywords:'frozen corn',edible:true},
   {id:'frozen-broccoli',name:'Frozen broccoli florets',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#4f7a3f',accent:'#e8e4d2'},base:399,keywords:'frozen broccoli',edible:true},
   {id:'frozen-mixed-veg',name:'Mixed vegetables',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#e8943a',accent:'#5f8a3f'},base:349,keywords:'frozen mixed vegetables',edible:true},
   {id:'frozen-spinach',name:'Frozen chopped spinach',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#3f6f3a',accent:'#e8e4d2'},base:349,keywords:'frozen spinach',edible:true},
   {id:'frozen-edamame',name:'Frozen edamame',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',art:{template:'bag',colour:'#7fa650',accent:'#e8e4d2'},base:499,keywords:'frozen edamame soybeans',edible:true},
  ]},
  {id:'frozen-fruit',name:'Frozen fruit',departmentId:'frozen',items:[
   {id:'frozen-berries',name:'Frozen mixed berries',brand:'Compliments',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',art:{template:'bag',colour:'#7f3f5f',accent:'#e8e4d2'},base:599,keywords:'frozen berries mixed',edible:true},
   {id:'frozen-blueberries',name:'Frozen blueberries',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',art:{template:'bag',colour:'#4a5fa5',accent:'#e8e4d2'},base:699,keywords:'frozen blueberries',edible:true},
   {id:'frozen-strawberries',name:'Frozen strawberries',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',art:{template:'bag',colour:'#d6423f',accent:'#e8e4d2'},base:599,keywords:'frozen strawberries',edible:true},
   {id:'frozen-mango',name:'Frozen mango chunks',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',art:{template:'bag',colour:'#e0a03a',accent:'#e8e4d2'},base:649,keywords:'frozen mango',edible:true},
  ]},
  {id:'frozen-meals',name:'Frozen meals & pizza',departmentId:'frozen',items:[
   {id:'frozen-pizza',name:'Pepperoni pizza',brand:'Delissio',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',art:{template:'pizza',colour:'#c94038',accent:'#e8c44a'},base:699,keywords:'frozen pizza pepperoni',edible:true},
   {id:'frozen-lasagna',name:'Frozen lasagna',brand:'Stouffer’s',size:'1.1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',art:{template:'tray',colour:'#c94038',accent:'#e8dcc4'},base:1099,keywords:'frozen lasagna meal',edible:true},
   {id:'frozen-dinner',name:'Chicken dinner',brand:'Swanson',size:'300 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',art:{template:'tray',colour:'#8f5f3a',accent:'#e8dcc4'},base:399,keywords:'frozen dinner tv meal',edible:true},
   {id:'perogies',name:'Potato perogies',brand:'Cheemo',size:'907 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',art:{template:'box',colour:'#e8c44a',accent:'#c94038'},base:549,keywords:'perogies pierogies frozen',edible:true},
   {id:'spring-rolls',name:'Vegetable spring rolls',brand:'President’s Choice',size:'624 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',art:{template:'box',colour:'#c9703a',accent:'#7fa650'},base:699,keywords:'spring rolls frozen appetizer',edible:true},
  ]},
  {id:'frozen-potato',name:'Frozen potatoes',departmentId:'frozen',items:[
   {id:'french-fries',name:'Straight cut fries',brand:'McCain',size:'1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',art:{template:'bag',colour:'#c94038',accent:'#e8c44a'},base:499,keywords:'fries frozen french',edible:true},
   {id:'hash-browns',name:'Hash brown patties',brand:'McCain',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:499,keywords:'hash browns frozen',edible:true},
   {id:'tater-tots',name:'Potato tots',brand:'McCain',size:'1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',art:{template:'bag',colour:'#e8943a',accent:'#c94038'},base:549,keywords:'tater tots frozen',edible:true},
  ]},
  {id:'frozen-seafood',name:'Frozen seafood & meat',departmentId:'frozen',items:[
   {id:'fish-sticks',name:'Breaded fish sticks',brand:'High Liner',size:'700 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',art:{template:'box',colour:'#3f6fae',accent:'#e8c44a'},base:799,keywords:'fish sticks frozen breaded',edible:true},
   {id:'frozen-shrimp',name:'Cooked shrimp ring',brand:'Frozen',size:'454 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',art:{template:'shrimp',colour:'#e08f7f',accent:'#c94038'},base:999,keywords:'shrimp ring frozen',edible:true},
   {id:'chicken-nuggets',name:'Chicken nuggets',brand:'Janes',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',art:{template:'box',colour:'#e8c44a',accent:'#c9703a'},base:899,keywords:'chicken nuggets frozen',edible:true},
   {id:'frozen-burgers',name:'Beef burger patties',brand:'Frozen',size:'1.13 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',art:{template:'box',colour:'#8f4f3a',accent:'#c94038'},base:1299,keywords:'burgers patties frozen',edible:true},
  ]},
  {id:'ice-cream',name:'Ice cream & desserts',departmentId:'frozen',items:[
   {id:'ice-cream',name:'Vanilla ice cream',brand:'Chapman’s',size:'2 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'tub',colour:'#f2ece0',accent:'#c9a233'},base:549,keywords:'ice cream vanilla',edible:true},
   {id:'chocolate-ice-cream',name:'Chocolate ice cream',brand:'Chapman’s',size:'2 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'tub',colour:'#5f3a28',accent:'#e8dcc4'},base:549,keywords:'ice cream chocolate',edible:true},
   {id:'ice-cream-bars',name:'Ice cream bars',brand:'Häagen-Dazs',size:'3 bars',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'box',colour:'#5f3a28',accent:'#c9a233'},base:799,keywords:'ice cream bars',edible:true},
   {id:'frozen-yogurt',name:'Frozen yogurt',brand:'Yasso',size:'500 mL',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'tub',colour:'#f2ece0',accent:'#5fae9f'},base:599,keywords:'frozen yogurt',edible:true},
   {id:'popsicles',name:'Freezer pops',brand:'Chapman’s',size:'24 pops',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'box',colour:'#4fae9f',accent:'#c94038'},base:399,keywords:'popsicles freezies',edible:true},
   {id:'whipped-topping',name:'Whipped topping',brand:'Cool Whip',size:'1 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',art:{template:'tub',colour:'#f2f4f0',accent:'#5f9fbd'},base:399,keywords:'whipped topping cool whip',edible:true},
  ]},
  {id:'frozen-breakfast',name:'Frozen breakfast',departmentId:'frozen',items:[
   {id:'waffles',name:'Frozen waffles',brand:'Eggo',size:'280 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-breakfast',aisle:'Frozen breakfast',art:{template:'box',colour:'#e8c44a',accent:'#c9703a'},base:449,keywords:'waffles frozen eggo',edible:true},
   {id:'breakfast-sandwiches',name:'Breakfast sandwiches',brand:'Jimmy Dean',size:'4 sandwiches',departmentId:'frozen',department:'Frozen',aisleId:'frozen-breakfast',aisle:'Frozen breakfast',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:799,keywords:'breakfast sandwich frozen',edible:true},
  ]},
 ]},
 {id:'beverages',name:'Beverages',edible:true,aisles:[
  {id:'water',name:'Water',departmentId:'beverages',items:[
   {id:'bottled-water',name:'Spring water',brand:'Nestlé Pure Life',size:'24 × 500 mL',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',art:{template:'bottle',colour:'#5f9fbd',accent:'#f2f4f0'},base:499,keywords:'water bottled spring',edible:true},
   {id:'sparkling-water',name:'Sparkling water',brand:'Bubly',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',art:{template:'can',colour:'#5fae9f',accent:'#f2f4f0'},base:699,keywords:'sparkling water soda club',edible:true},
   {id:'jug-water',name:'Distilled water',brand:'No Name',size:'4 L',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',art:{template:'jug',colour:'#f2f4f0',accent:'#5f9fbd'},base:249,keywords:'water distilled jug',edible:true},
  ]},
  {id:'juice',name:'Juice',departmentId:'beverages',items:[
   {id:'orange-juice',name:'Orange juice',brand:'Tropicana',size:'1.75 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'carton',colour:'#e08334',accent:'#c9701f'},base:599,keywords:'orange juice oj',edible:true},
   {id:'apple-juice',name:'Apple juice',brand:'Allen’s',size:'1.36 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'bottle',colour:'#d9a03a',accent:'#7fa650'},base:349,keywords:'apple juice',edible:true},
   {id:'cranberry-juice',name:'Cranberry cocktail',brand:'Ocean Spray',size:'1.89 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'bottle',colour:'#b4303c',accent:'#e8e4d2'},base:499,keywords:'cranberry juice',edible:true},
   {id:'grape-juice',name:'Grape juice',brand:'Welch’s',size:'1.36 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'bottle',colour:'#5f2f5f',accent:'#7f4f7f'},base:499,keywords:'grape juice',edible:true},
   {id:'juice-boxes',name:'Apple juice boxes',brand:'Oasis',size:'8 × 200 mL',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'box',colour:'#e8c44a',accent:'#7fa650'},base:449,keywords:'juice boxes kids',edible:true},
   {id:'lemonade',name:'Lemonade',brand:'Simply',size:'1.54 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',art:{template:'carton',colour:'#e4c64a',accent:'#f2ece0'},base:449,keywords:'lemonade',edible:true},
  ]},
  {id:'soft-drinks',name:'Soft drinks',departmentId:'beverages',items:[
   {id:'cola',name:'Cola',brand:'Coca-Cola',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',art:{template:'can',colour:'#c94038',accent:'#f2f4f0'},base:799,keywords:'cola coke pop soda',edible:true},
   {id:'diet-cola',name:'Diet cola',brand:'Coca-Cola',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',art:{template:'can',colour:'#3f3a38',accent:'#c94038'},base:799,keywords:'diet cola coke pop',edible:true},
   {id:'ginger-ale',name:'Ginger ale',brand:'Canada Dry',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',art:{template:'can',colour:'#5f8a3f',accent:'#e8c44a'},base:799,keywords:'ginger ale pop soda',edible:true},
   {id:'root-beer',name:'Root beer',brand:'A&W',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',art:{template:'can',colour:'#5f3a28',accent:'#e8c44a'},base:799,keywords:'root beer pop soda',edible:true},
   {id:'lemon-lime',name:'Lemon lime soda',brand:'Sprite',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',art:{template:'can',colour:'#5f8a3f',accent:'#f2f4f0'},base:799,keywords:'sprite pop soda lemon lime',edible:true},
  ]},
  {id:'coffee-aisle',name:'Coffee',departmentId:'beverages',items:[
   {id:'coffee',name:'Medium roast coffee',brand:'Tim Hortons',size:'300 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'coffeebag',colour:'#c94038',accent:'#8f5f3a'},base:999,keywords:'coffee ground medium',edible:true},
   {id:'coffee-store',name:'Medium roast coffee',brand:'Store brand',size:'300 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'coffeebag',colour:'#8f5f3a',accent:'#5f3a28'},base:749,keywords:'coffee ground store',edible:true},
   {id:'dark-roast',name:'Dark roast coffee',brand:'Starbucks',size:'340 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'coffeebag',colour:'#2f5f4a',accent:'#5f3a28'},base:1299,keywords:'coffee dark roast',edible:true},
   {id:'coffee-pods',name:'Coffee pods',brand:'Keurig',size:'30 pods',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'box',colour:'#c94038',accent:'#8f5f3a'},base:1899,keywords:'coffee pods k cups',edible:true},
   {id:'instant-coffee',name:'Instant coffee',brand:'Nescafé',size:'200 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'jar',colour:'#c94038',accent:'#5f3a28'},base:899,keywords:'instant coffee',edible:true},
   {id:'whole-bean',name:'Whole bean coffee',brand:'Kicking Horse',size:'454 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',art:{template:'coffeebag',colour:'#3f3a38',accent:'#c9873a'},base:1599,keywords:'coffee whole bean',edible:true},
  ]},
  {id:'tea-aisle',name:'Tea',departmentId:'beverages',items:[
   {id:'black-tea',name:'Orange pekoe tea',brand:'Red Rose',size:'72 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',art:{template:'teabox',colour:'#c94038',accent:'#e8c44a'},base:549,keywords:'tea black orange pekoe',edible:true},
   {id:'green-tea',name:'Green tea',brand:'Tetley',size:'48 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',art:{template:'teabox',colour:'#5f8a3f',accent:'#e8e4d2'},base:499,keywords:'tea green',edible:true},
   {id:'herbal-tea',name:'Chamomile tea',brand:'Celestial',size:'20 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',art:{template:'teabox',colour:'#e8c44a',accent:'#7fa650'},base:449,keywords:'tea herbal chamomile',edible:true},
   {id:'chai',name:'Chai tea',brand:'Tetley',size:'20 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',art:{template:'teabox',colour:'#8f5f3a',accent:'#c9873a'},base:449,keywords:'tea chai spiced',edible:true},
  ]},
  {id:'energy',name:'Sports & energy',departmentId:'beverages',items:[
   {id:'sports-drink',name:'Sports drink',brand:'Gatorade',size:'6 × 591 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',art:{template:'bottle',colour:'#e8943a',accent:'#c94038'},base:899,keywords:'gatorade sports drink',edible:true},
   {id:'energy-drink',name:'Energy drink',brand:'Red Bull',size:'4 × 250 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',art:{template:'can',colour:'#3f5fa5',accent:'#c94038'},base:1099,keywords:'energy drink red bull',edible:true},
   {id:'protein-shake',name:'Protein shake',brand:'Premier Protein',size:'4 × 325 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',art:{template:'carton',colour:'#3f3a38',accent:'#c9a233'},base:1299,keywords:'protein shake drink',edible:true},
  ]},
 ]},
 {id:'household',name:'Household',edible:false,aisles:[
  {id:'paper',name:'Paper products',departmentId:'household',items:[
   {id:'toilet-paper',name:'Bathroom tissue',brand:'Cashmere',size:'12 rolls',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',art:{template:'roll',colour:'#f2f4f0',accent:'#d95f8a'},base:999,keywords:'toilet paper bathroom tissue',edible:false},
   {id:'paper-towel',name:'Paper towels',brand:'Bounty',size:'6 rolls',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',art:{template:'roll',colour:'#f2f4f0',accent:'#3f6fae'},base:1099,keywords:'paper towel kitchen',edible:false},
   {id:'facial-tissue',name:'Facial tissue',brand:'Kleenex',size:'6 boxes',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',art:{template:'box',colour:'#5f9fbd',accent:'#f2f4f0'},base:799,keywords:'kleenex tissue facial',edible:false},
   {id:'napkins',name:'Paper napkins',brand:'Royale',size:'200 napkins',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',art:{template:'box',colour:'#e8c44a',accent:'#f2f4f0'},base:449,keywords:'napkins serviettes',edible:false},
  ]},
  {id:'cleaning',name:'Cleaning',departmentId:'household',items:[
   {id:'all-purpose-cleaner',name:'All purpose cleaner',brand:'Mr. Clean',size:'1.4 L',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'spray',colour:'#3f6fae',accent:'#f2f4f0'},base:549,keywords:'cleaner all purpose spray',edible:false},
   {id:'glass-cleaner',name:'Glass cleaner',brand:'Windex',size:'950 mL',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'spray',colour:'#3f8abd',accent:'#f2f4f0'},base:449,keywords:'glass cleaner windex window',edible:false},
   {id:'bleach',name:'Liquid bleach',brand:'Javex',size:'1.78 L',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'jug',colour:'#f2f4f0',accent:'#3f6fae'},base:449,keywords:'bleach javex',edible:false},
   {id:'disinfecting-wipes',name:'Disinfecting wipes',brand:'Lysol',size:'80 wipes',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'can',colour:'#3f6fae',accent:'#f2f4f0'},base:649,keywords:'wipes disinfecting lysol',edible:false},
   {id:'toilet-cleaner',name:'Toilet bowl cleaner',brand:'Lysol',size:'710 mL',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'bottle',colour:'#3f6fae',accent:'#5fae9f'},base:449,keywords:'toilet cleaner bowl',edible:false},
   {id:'garbage-bags',name:'Kitchen garbage bags',brand:'Glad',size:'40 bags',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',art:{template:'box',colour:'#3f3a38',accent:'#5f8a3f'},base:899,keywords:'garbage bags trash',edible:false},
  ]},
  {id:'laundry',name:'Laundry',departmentId:'household',items:[
   {id:'laundry-detergent',name:'Liquid laundry detergent',brand:'Tide',size:'2.72 L',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',art:{template:'jug',colour:'#e8943a',accent:'#3f5fa5'},base:1699,keywords:'laundry detergent tide',edible:false},
   {id:'laundry-pods',name:'Laundry pods',brand:'Tide',size:'42 pods',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',art:{template:'tub',colour:'#e8943a',accent:'#3f5fa5'},base:1899,keywords:'laundry pods detergent',edible:false},
   {id:'fabric-softener',name:'Fabric softener',brand:'Downy',size:'2.03 L',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',art:{template:'jug',colour:'#5f7fbd',accent:'#f2f4f0'},base:899,keywords:'fabric softener downy',edible:false},
   {id:'dryer-sheets',name:'Dryer sheets',brand:'Bounce',size:'160 sheets',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',art:{template:'box',colour:'#e8c44a',accent:'#5f9fbd'},base:699,keywords:'dryer sheets bounce',edible:false},
   {id:'stain-remover',name:'Stain remover spray',brand:'Shout',size:'650 mL',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',art:{template:'spray',colour:'#e8943a',accent:'#f2f4f0'},base:649,keywords:'stain remover',edible:false},
  ]},
  {id:'dish',name:'Dish',departmentId:'household',items:[
   {id:'dish-soap',name:'Dish soap',brand:'Palmolive',size:'740 mL',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',art:{template:'bottle',colour:'#5f8a3f',accent:'#e8e4d2'},base:399,keywords:'dish soap washing up',edible:false},
   {id:'dishwasher-pods',name:'Dishwasher pods',brand:'Cascade',size:'45 pods',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',art:{template:'tub',colour:'#3f6fae',accent:'#5fae9f'},base:1399,keywords:'dishwasher pods cascade',edible:false},
   {id:'sponges',name:'Scrub sponges',brand:'Scotch-Brite',size:'6 sponges',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',art:{template:'bag',colour:'#e8c44a',accent:'#5f8a3f'},base:549,keywords:'sponges scrub dish',edible:false},
  ]},
  {id:'storage',name:'Food storage & foil',departmentId:'household',items:[
   {id:'aluminum-foil',name:'Aluminum foil',brand:'Alcan',size:'30 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',art:{template:'box',colour:'#bdc4cf',accent:'#3f5fa5'},base:699,keywords:'foil aluminum tin',edible:false},
   {id:'plastic-wrap',name:'Plastic wrap',brand:'Glad',size:'60 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',art:{template:'box',colour:'#5f9fbd',accent:'#f2f4f0'},base:549,keywords:'plastic wrap cling film',edible:false},
   {id:'parchment-paper',name:'Parchment paper',brand:'PC',size:'20 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',art:{template:'box',colour:'#e8dcc4',accent:'#5f8a3f'},base:549,keywords:'parchment paper baking',edible:false},
   {id:'sandwich-bags',name:'Sandwich bags',brand:'Ziploc',size:'100 bags',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',art:{template:'box',colour:'#3f6fae',accent:'#f2f4f0'},base:549,keywords:'ziploc sandwich bags',edible:false},
   {id:'freezer-bags',name:'Freezer bags',brand:'Ziploc',size:'40 bags',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',art:{template:'box',colour:'#3f5fa5',accent:'#f2f4f0'},base:649,keywords:'ziploc freezer bags',edible:false},
  ]},
 ]},
 {id:'personal',name:'Personal care',edible:false,aisles:[
  {id:'hair',name:'Hair care',departmentId:'personal',items:[
   {id:'shampoo',name:'Daily shampoo',brand:'Head & Shoulders',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',art:{template:'bottle',colour:'#3f6fae',accent:'#f2f4f0'},base:899,keywords:'shampoo hair',edible:false},
   {id:'conditioner',name:'Daily conditioner',brand:'Head & Shoulders',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',art:{template:'bottle',colour:'#5f9fbd',accent:'#f2f4f0'},base:899,keywords:'conditioner hair',edible:false},
   {id:'hair-spray',name:'Hair spray',brand:'TRESemmé',size:'311 g',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',art:{template:'spray',colour:'#3f3a38',accent:'#c9a233'},base:649,keywords:'hair spray styling',edible:false},
  ]},
  {id:'oral',name:'Oral care',departmentId:'personal',items:[
   {id:'toothpaste',name:'Cavity protection toothpaste',brand:'Crest',size:'2 × 130 mL',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',art:{template:'tube',colour:'#3f5fa5',accent:'#c94038'},base:649,keywords:'toothpaste crest',edible:false},
   {id:'toothbrush',name:'Soft toothbrushes',brand:'Oral-B',size:'2 brushes',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',art:{template:'toothbrush',colour:'#3f6fae',accent:'#f2f4f0'},base:599,keywords:'toothbrush',edible:false},
   {id:'mouthwash',name:'Antiseptic mouthwash',brand:'Listerine',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',art:{template:'bottle',colour:'#3f8a7f',accent:'#f2f4f0'},base:799,keywords:'mouthwash listerine',edible:false},
   {id:'floss',name:'Dental floss',brand:'Oral-B',size:'50 m',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',art:{template:'box',colour:'#3f6fae',accent:'#5fae9f'},base:449,keywords:'floss dental',edible:false},
  ]},
  {id:'body',name:'Body & soap',departmentId:'personal',items:[
   {id:'body-wash',name:'Moisturizing body wash',brand:'Dove',size:'750 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',art:{template:'bottle',colour:'#f2f4f0',accent:'#c9a8bd'},base:799,keywords:'body wash shower gel',edible:false},
   {id:'bar-soap',name:'Beauty bar soap',brand:'Dove',size:'6 bars',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',art:{template:'soapbar',colour:'#f2f4f0',accent:'#c9a8bd'},base:799,keywords:'soap bar',edible:false},
   {id:'hand-soap',name:'Hand soap',brand:'Softsoap',size:'332 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',art:{template:'bottle',colour:'#5fae9f',accent:'#f2f4f0'},base:349,keywords:'hand soap',edible:false},
   {id:'lotion',name:'Body lotion',brand:'Nivea',size:'400 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',art:{template:'bottle',colour:'#3f5fa5',accent:'#f2f4f0'},base:799,keywords:'lotion moisturizer body',edible:false},
   {id:'sunscreen',name:'Sunscreen SPF 50',brand:'Banana Boat',size:'240 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',art:{template:'bottle',colour:'#e8c44a',accent:'#3f6fae'},base:1299,keywords:'sunscreen spf sun',edible:false},
  ]},
  {id:'deodorant',name:'Deodorant & shaving',departmentId:'personal',items:[
   {id:'deodorant-stick',name:'Antiperspirant',brand:'Degree',size:'76 g',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',art:{template:'tube',colour:'#3f3a38',accent:'#5f9fbd'},base:549,keywords:'deodorant antiperspirant',edible:false},
   {id:'razors',name:'Disposable razors',brand:'Gillette',size:'5 razors',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',art:{template:'box',colour:'#3f5fa5',accent:'#e8943a'},base:899,keywords:'razors shaving disposable',edible:false},
   {id:'shaving-cream',name:'Shaving gel',brand:'Gillette',size:'198 g',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',art:{template:'spray',colour:'#5f9fbd',accent:'#f2f4f0'},base:549,keywords:'shaving cream gel',edible:false},
  ]},
  {id:'health',name:'Health & first aid',departmentId:'personal',items:[
   {id:'pain-relief',name:'Extra strength tablets',brand:'Tylenol',size:'100 caplets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',art:{template:'box',colour:'#c94038',accent:'#f2f4f0'},base:1499,keywords:'tylenol pain relief acetaminophen',edible:false},
   {id:'ibuprofen',name:'Ibuprofen tablets',brand:'Advil',size:'72 caplets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',art:{template:'box',colour:'#3f5fa5',accent:'#e8c44a'},base:1299,keywords:'advil ibuprofen pain',edible:false},
   {id:'bandages',name:'Assorted bandages',brand:'Band-Aid',size:'60 bandages',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',art:{template:'box',colour:'#e8c44a',accent:'#c94038'},base:699,keywords:'bandages band aid first aid',edible:false},
   {id:'vitamins',name:'Multivitamin',brand:'Centrum',size:'90 tablets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',art:{template:'jar',colour:'#e8943a',accent:'#f2f4f0'},base:1899,keywords:'vitamins multivitamin',edible:false},
   {id:'hand-sanitizer',name:'Hand sanitizer',brand:'Purell',size:'354 mL',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',art:{template:'bottle',colour:'#5fae9f',accent:'#f2f4f0'},base:649,keywords:'hand sanitizer',edible:false},
  ]},
 ]},
 {id:'baby',name:'Baby & child',edible:false,aisles:[
  {id:'diapers',name:'Diapers & wipes',departmentId:'baby',items:[
   {id:'diapers',name:'Baby dry diapers',brand:'Pampers',size:'Size 4, 92 count',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',art:{template:'diaper',colour:'#5f9fbd',accent:'#f2f4f0'},base:3499,keywords:'diapers pampers',edible:false},
   {id:'baby-wipes',name:'Sensitive baby wipes',brand:'Pampers',size:'576 wipes',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',art:{template:'box',colour:'#5fae9f',accent:'#f2f4f0'},base:2299,keywords:'baby wipes',edible:false},
   {id:'training-pants',name:'Training pants',brand:'Pull-Ups',size:'74 count',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',art:{template:'diaper',colour:'#e8c44a',accent:'#5f9fbd'},base:3299,keywords:'pull ups training pants',edible:false},
  ]},
  {id:'baby-food',name:'Baby food & formula',departmentId:'baby',items:[
   {id:'baby-cereal',name:'Infant rice cereal',brand:'Gerber',size:'227 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',art:{template:'box',colour:'#e8c44a',accent:'#5f9fbd'},base:499,keywords:'baby cereal infant',edible:false},
   {id:'baby-puree',name:'Fruit puree pouches',brand:'Gerber',size:'4 × 128 mL',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',art:{template:'pouch',colour:'#e8943a',accent:'#7fa650'},base:499,keywords:'baby food puree pouch',edible:false},
   {id:'infant-formula',name:'Infant formula',brand:'Similac',size:'658 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',art:{template:'can',colour:'#5f9fbd',accent:'#e8c44a'},base:3999,keywords:'formula infant baby',edible:false},
   {id:'toddler-snacks',name:'Puffs snack',brand:'Gerber',size:'42 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',art:{template:'jar',colour:'#e8c44a',accent:'#7fa650'},base:349,keywords:'baby puffs toddler snack',edible:false},
  ]},
  {id:'baby-care',name:'Baby care',departmentId:'baby',items:[
   {id:'baby-shampoo',name:'Baby shampoo',brand:'Johnson’s',size:'800 mL',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',art:{template:'bottle',colour:'#e8c44a',accent:'#f2f4f0'},base:899,keywords:'baby shampoo',edible:false},
   {id:'diaper-cream',name:'Diaper rash cream',brand:'Penaten',size:'100 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',art:{template:'tube',colour:'#e8c44a',accent:'#f2f4f0'},base:799,keywords:'diaper cream rash',edible:false},
  ]},
 ]},
 {id:'pet',name:'Pet',edible:false,aisles:[
  {id:'dog',name:'Dog',departmentId:'pet',items:[
   {id:'dog-food-dry',name:'Dry dog food',brand:'Pedigree',size:'8 kg',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',art:{template:'bag',colour:'#e8c44a',accent:'#c94038'},base:2499,keywords:'dog food dry kibble',edible:false},
   {id:'dog-food-wet',name:'Wet dog food',brand:'Pedigree',size:'12 × 300 g',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',art:{template:'can',colour:'#e8c44a',accent:'#8f5f3a'},base:1899,keywords:'dog food wet canned',edible:false},
   {id:'dog-treats',name:'Dog biscuits',brand:'Milk-Bone',size:'1.8 kg',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',art:{template:'box',colour:'#c94038',accent:'#e8c44a'},base:1099,keywords:'dog treats biscuits',edible:false},
  ]},
  {id:'cat',name:'Cat',departmentId:'pet',items:[
   {id:'cat-food-dry',name:'Dry cat food',brand:'Whiskas',size:'3 kg',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',art:{template:'bag',colour:'#5f7fbd',accent:'#e8943a'},base:1599,keywords:'cat food dry kibble',edible:false},
   {id:'cat-food-wet',name:'Wet cat food',brand:'Whiskas',size:'12 × 85 g',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',art:{template:'pouch',colour:'#5f7fbd',accent:'#e8943a'},base:999,keywords:'cat food wet pouches',edible:false},
   {id:'cat-litter',name:'Clumping cat litter',brand:'Tidy Cats',size:'16 kg',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',art:{template:'jug',colour:'#e8c44a',accent:'#3f5fa5'},base:1999,keywords:'cat litter',edible:false},
  ]},
 ]},
];

export const ALL_ITEMS:CatalogueItem[] = DEPARTMENTS.flatMap(d=>d.aisles.flatMap(a=>a.items));
export const itemById:Record<string,CatalogueItem> = Object.fromEntries(ALL_ITEMS.map(i=>[i.id,i]));
export const AISLES:Aisle[] = DEPARTMENTS.flatMap(d=>d.aisles);
export const departmentById = (id:string)=>DEPARTMENTS.find(d=>d.id===id)??null;
export const aisleById = (id:string)=>AISLES.find(a=>a.id===id)??null;

/** Department display names, in shopping order. Used for the legacy category filter. */
export const DEPARTMENT_NAMES:string[] = DEPARTMENTS.map(d=>d.name);

const normalize = (s:string)=>s.toLowerCase().normalize('NFKD').replace(/[\u2018\u2019']/g,'').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);

/**
 * Keyword search across name, brand, aisle, department and the item's own
 * synonyms, so "pop" finds cola and "capsicum" finds bell peppers. Ranked by
 * how early and how completely the terms match.
 */
export function searchItems(query:string,limit=60):CatalogueItem[]{
 const terms=normalize(query);
 if(!terms.length)return [];
 const scored:{item:CatalogueItem;score:number}[]=[];
 for(const item of ALL_ITEMS){
  const name=normalize(item.name);
  const haystack=[...name,...normalize(item.brand),...normalize(item.aisle),...normalize(item.department),...normalize(item.keywords)];
  let score=0,matched=0;
  for(const term of terms){
   const exact=haystack.includes(term);
   const partial=!exact&&haystack.some(word=>word.startsWith(term));
   if(!exact&&!partial)continue;
   matched+=1;
   score+=exact?3:1;
   if(name.includes(term))score+=4;
   if(name[0]===term)score+=3;
  }
  if(matched===terms.length)scored.push({item,score});
 }
 return scored.sort((a,b)=>b.score-a.score||a.item.name.localeCompare(b.item.name)).slice(0,limit).map(r=>r.item);
}

