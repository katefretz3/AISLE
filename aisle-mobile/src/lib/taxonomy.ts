// Aisle product taxonomy.
//
// Three levels, the way a shopper actually looks for something:
//   Department (Produce) → Aisle (Fruit) → Item (Blueberries)
//
// This file is the single source of truth for the catalogue. `catalog.ts`
// derives its product records from it, the category browser navigates it, and
// `tools/fetch-product-photos.mjs` uses each item's `photo` query to pull a
// generic, unbranded photograph. Until an item has one, it is shown as its
// department's colour and a symbol for its aisle (lib/product-glyph.ts).
//
// `edible: false` marks the non-grocery departments. Dietary preferences and
// ingredient restrictions must not suppress toilet paper.
//
// Aisle placement is checked by tools/ia-study.mjs (card sort + tree test).
// Items people look for in more than one place carry `alsoIn`, which makes
// them appear in those aisles too rather than forcing a single home.

export type CatalogueItem = {
 id:string;name:string;brand:string;size:string;
 departmentId:string;department:string;aisleId:string;aisle:string;
 /** What the item looks like, which picks its symbol when there is no photo. */
 shape:string;keywords:string;edible:boolean;
 /** Generic, brand-free search phrase for the photo pipeline. */
 photo:string;
 /** Extra aisle ids this item also appears under. */
 alsoIn?:string[];
};
export type Aisle = {id:string;name:string;departmentId:string;items:CatalogueItem[]};
export type Department = {id:string;name:string;edible:boolean;aisles:Aisle[]};

export const DEPARTMENTS:Department[] = [
 {id:'produce',name:'Produce',edible:true,aisles:[
  {id:'fruit',name:'Fruit',departmentId:'produce',items:[
   {id:'apples',name:'Gala apples',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'gala apple fruit',edible:true,photo:'gala apples'},
   {id:'granny-smith',name:'Granny Smith apples',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'green apple tart',edible:true,photo:'granny smith apples'},
   {id:'bananas',name:'Bananas',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'banana',keywords:'banana',edible:true,photo:'bananas'},
   {id:'blueberries',name:'Blueberries',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'berry',keywords:'blueberry berries',edible:true,photo:'blueberries'},
   {id:'strawberries',name:'Fresh strawberries',brand:'Fresh produce',size:'454 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'strawberry',keywords:'strawberry berries',edible:true,photo:'strawberries'},
   {id:'raspberries',name:'Raspberries',brand:'Fresh produce',size:'170 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'berry',keywords:'raspberry berries',edible:true,photo:'raspberries'},
   {id:'blackberries',name:'Blackberries',brand:'Fresh produce',size:'170 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'berry',keywords:'blackberry berries',edible:true,photo:'blackberries'},
   {id:'grapes-red',name:'Red seedless grapes',brand:'Fresh produce',size:'908 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'grapes',keywords:'grape grapes red',edible:true,photo:'red seedless grapes'},
   {id:'grapes-green',name:'Green seedless grapes',brand:'Fresh produce',size:'908 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'grapes',keywords:'grape grapes green',edible:true,photo:'green seedless grapes'},
   {id:'oranges',name:'Navel oranges',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'citrus',keywords:'orange citrus',edible:true,photo:'navel oranges'},
   {id:'clementines',name:'Clementines',brand:'Fresh produce',size:'2 lb box',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'citrus',keywords:'clementine mandarin citrus',edible:true,photo:'clementines'},
   {id:'lemons',name:'Lemons',brand:'Fresh produce',size:'Bag of 4',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'citrus',keywords:'lemon citrus',edible:true,photo:'lemons'},
   {id:'limes',name:'Limes',brand:'Fresh produce',size:'Bag of 5',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'citrus',keywords:'lime citrus',edible:true,photo:'limes'},
   {id:'grapefruit',name:'Ruby grapefruit',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'citrus',keywords:'grapefruit citrus',edible:true,photo:'ruby grapefruit'},
   {id:'pears',name:'Bartlett pears',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'pear',keywords:'pear',edible:true,photo:'bartlett pears'},
   {id:'peaches',name:'Peaches',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'peach stone fruit',edible:true,photo:'peaches'},
   {id:'plums',name:'Black plums',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'plum stone fruit',edible:true,photo:'black plums'},
   {id:'nectarines',name:'Nectarines',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'nectarine stone fruit',edible:true,photo:'nectarines'},
   {id:'mangoes',name:'Mangoes',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'mango tropical',edible:true,photo:'mangoes'},
   {id:'pineapple',name:'Pineapple',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'pineapple',keywords:'pineapple tropical',edible:true,photo:'pineapple'},
   {id:'kiwi',name:'Kiwifruit',brand:'Fresh produce',size:'Pack of 4',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'kiwi tropical',edible:true,photo:'kiwifruit'},
   {id:'avocados',name:'Avocados',brand:'Fresh produce',size:'Bag of 5',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'avocado',keywords:'avocado',edible:true,photo:'avocados'},
   {id:'watermelon',name:'Seedless watermelon',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'melon',keywords:'watermelon melon',edible:true,photo:'seedless watermelon'},
   {id:'cantaloupe',name:'Cantaloupe',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'melon',keywords:'cantaloupe melon',edible:true,photo:'cantaloupe'},
   {id:'cranberries-fresh',name:'Fresh cranberries',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'berry',keywords:'cranberry berries',edible:true,photo:'cranberries'},
   {id:'pomegranate',name:'Pomegranate',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'pomegranate',edible:true,photo:'pomegranate'},
   {id:'cherries',name:'Sweet cherries',brand:'Fresh produce',size:'454 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'berry',keywords:'cherry cherries',edible:true,photo:'sweet cherries'},
   {id:'apricots',name:'Apricots',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'round',keywords:'apricot stone fruit',edible:true,photo:'apricots'},
   {id:'figs',name:'Fresh figs',brand:'Fresh produce',size:'250 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'pear',keywords:'fig figs',edible:true,photo:'figs'},
   {id:'papaya',name:'Papaya',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'melon',keywords:'papaya tropical',edible:true,photo:'papaya'},
   {id:'plantains',name:'Plantains',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'banana',keywords:'plantain cooking banana',edible:true,photo:'plantains'},
   {id:'cut-fruit',name:'Cut fruit tray',brand:'Fresh produce',size:'600 g',departmentId:'produce',department:'Produce',aisleId:'fruit',aisle:'Fruit',shape:'tray',keywords:'fruit tray cut platter',edible:true,photo:'cut fruit tray'},
  ]},
  {id:'vegetables',name:'Vegetables',departmentId:'produce',items:[
   {id:'tomatoes',name:'Roma tomatoes',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'round',keywords:'tomato tomatoes roma',edible:true,photo:'roma tomatoes'},
   {id:'cherry-tomatoes',name:'Cherry tomatoes',brand:'Fresh produce',size:'pint',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'berry',keywords:'cherry tomato grape tomatoes',edible:true,photo:'cherry tomatoes'},
   {id:'potatoes',name:'Yellow potatoes',brand:'Fresh produce',size:'5 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'potato potatoes yellow',edible:true,photo:'yellow potatoes'},
   {id:'russet-potatoes',name:'Russet potatoes',brand:'Fresh produce',size:'10 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'potato russet',edible:true,photo:'russet potatoes'},
   {id:'sweet-potatoes',name:'Sweet potatoes',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'sweet potato yam',edible:true,photo:'sweet potatoes'},
   {id:'onions',name:'Yellow onions',brand:'Fresh produce',size:'3 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'onion onions yellow',edible:true,photo:'yellow onions'},
   {id:'red-onions',name:'Red onions',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'onion red',edible:true,photo:'red onions'},
   {id:'garlic',name:'Garlic',brand:'Fresh produce',size:'3 bulbs',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'garlic',edible:true,photo:'garlic'},
   {id:'carrots',name:'Carrots',brand:'Fresh produce',size:'2 lb bag',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'carrot carrots',edible:true,photo:'carrots'},
   {id:'celery',name:'Celery',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'celery',edible:true,photo:'celery'},
   {id:'broccoli',name:'Broccoli crowns',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'floret',keywords:'broccoli',edible:true,photo:'broccoli crowns'},
   {id:'cauliflower',name:'Cauliflower',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'floret',keywords:'cauliflower',edible:true,photo:'cauliflower'},
   {id:'spinach',name:'Baby spinach',brand:'Fresh produce',size:'142 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'leafy',keywords:'spinach greens salad',edible:true,photo:'baby spinach',alsoIn:['salads']},
   {id:'lettuce',name:'Romaine hearts',brand:'Fresh produce',size:'Pack of 3',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'leafy',keywords:'lettuce romaine salad',edible:true,photo:'romaine hearts',alsoIn:['salads']},
   {id:'kale',name:'Curly kale',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'leafy',keywords:'kale greens',edible:true,photo:'curly kale'},
   {id:'cabbage',name:'Green cabbage',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'leafy',keywords:'cabbage',edible:true,photo:'green cabbage',alsoIn:['salads']},
   {id:'cucumber',name:'English cucumber',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'cucumber',edible:true,photo:'english cucumber'},
   {id:'zucchini',name:'Zucchini',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'zucchini courgette',edible:true,photo:'zucchini'},
   {id:'bell-peppers',name:'Sweet bell peppers',brand:'Fresh produce',size:'Pack of 3',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'pepper',keywords:'pepper peppers bell capsicum',edible:true,photo:'sweet bell peppers'},
   {id:'green-peppers',name:'Green peppers',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'pepper',keywords:'pepper green',edible:true,photo:'green peppers'},
   {id:'mushrooms',name:'White mushrooms',brand:'Fresh produce',size:'227 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'mushroom',keywords:'mushroom mushrooms',edible:true,photo:'white mushrooms'},
   {id:'cremini',name:'Cremini mushrooms',brand:'Fresh produce',size:'227 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'mushroom',keywords:'mushroom cremini brown',edible:true,photo:'cremini mushrooms'},
   {id:'corn',name:'Sweet corn',brand:'Fresh produce',size:'Pack of 4',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'corn',keywords:'corn cob',edible:true,photo:'sweet corn'},
   {id:'green-beans',name:'Green beans',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'green beans',edible:true,photo:'green beans',alsoIn:['frozen-veg']},
   {id:'asparagus',name:'Asparagus',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'asparagus',edible:true,photo:'asparagus'},
   {id:'brussels-sprouts',name:'Brussels sprouts',brand:'Fresh produce',size:'454 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'floret',keywords:'brussels sprouts',edible:true,photo:'brussels sprouts'},
   {id:'eggplant',name:'Eggplant',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'eggplant aubergine',edible:true,photo:'eggplant'},
   {id:'squash',name:'Butternut squash',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'squash butternut',edible:true,photo:'butternut squash'},
   {id:'beets',name:'Beets',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'beet beets beetroot',edible:true,photo:'beets'},
   {id:'turnip',name:'Turnip',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'turnip rutabaga',edible:true,photo:'turnip'},
   {id:'ginger',name:'Fresh ginger',brand:'Fresh produce',size:'200 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'ginger root',edible:true,photo:'ginger'},
   {id:'leeks',name:'Leeks',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'leek leeks',edible:true,photo:'leeks'},
   {id:'radishes',name:'Radishes',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'radish radishes',edible:true,photo:'radishes'},
   {id:'bok-choy',name:'Bok choy',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'leafy',keywords:'bok choy pak asian greens',edible:true,photo:'bok choy'},
   {id:'snap-peas',name:'Sugar snap peas',brand:'Fresh produce',size:'227 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'longveg',keywords:'snap peas mangetout',edible:true,photo:'sugar snap peas'},
   {id:'shallots',name:'Shallots',brand:'Fresh produce',size:'300 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'shallot shallots',edible:true,photo:'shallots'},
   {id:'chili-peppers',name:'Hot chili peppers',brand:'Fresh produce',size:'100 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'pepper',keywords:'chilli jalapeno pepper fresh',edible:true,photo:'hot chili peppers'},
   {id:'fennel',name:'Fennel bulb',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bulb',keywords:'fennel anise',edible:true,photo:'fennel bulb'},
   {id:'artichoke',name:'Globe artichoke',brand:'Fresh produce',size:'Each',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'floret',keywords:'artichoke',edible:true,photo:'globe artichoke'},
   {id:'parsnips',name:'Parsnips',brand:'Fresh produce',size:'1 kg',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'root',keywords:'parsnip parsnips',edible:true,photo:'parsnips'},
   {id:'cauliflower-rice',name:'Riced cauliflower',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'vegetables',aisle:'Vegetables',shape:'bag',keywords:'cauliflower riced low carb',edible:true,photo:'riced cauliflower'},
  ]},
  {id:'herbs',name:'Fresh herbs',departmentId:'produce',items:[
   {id:'basil',name:'Fresh basil',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'basil herb',edible:true,photo:'basil'},
   {id:'cilantro',name:'Fresh cilantro',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'cilantro coriander herb',edible:true,photo:'cilantro'},
   {id:'parsley',name:'Fresh parsley',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'parsley herb',edible:true,photo:'parsley'},
   {id:'green-onions',name:'Green onions',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'longveg',keywords:'green onion scallion spring',edible:true,photo:'green onions'},
   {id:'mint',name:'Fresh mint',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'mint herb',edible:true,photo:'mint'},
   {id:'rosemary',name:'Fresh rosemary',brand:'Fresh produce',size:'Pack',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'rosemary herb',edible:true,photo:'rosemary'},
   {id:'dill',name:'Fresh dill',brand:'Fresh produce',size:'Bunch',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'dill herb',edible:true,photo:'dill'},
   {id:'thyme',name:'Fresh thyme',brand:'Fresh produce',size:'Pack',departmentId:'produce',department:'Produce',aisleId:'herbs',aisle:'Fresh herbs',shape:'herb',keywords:'thyme herb',edible:true,photo:'thyme'},
  ]},
  {id:'salads',name:'Packaged salads',departmentId:'produce',items:[
   {id:'spring-mix',name:'Spring mix',brand:'Fresh produce',size:'142 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'bag',keywords:'salad greens mix',edible:true,photo:'spring mix',alsoIn:['vegetables']},
   {id:'caesar-kit',name:'Caesar salad kit',brand:'Fresh produce',size:'300 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'bag',keywords:'salad kit caesar',edible:true,photo:'caesar salad kit'},
   {id:'coleslaw',name:'Coleslaw mix',brand:'Fresh produce',size:'340 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'bag',keywords:'coleslaw slaw cabbage',edible:true,photo:'coleslaw mix',alsoIn:['vegetables']},
   {id:'veg-tray',name:'Vegetable tray',brand:'Fresh produce',size:'500 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'tray',keywords:'veggie tray platter',edible:true,photo:'vegetable tray'},
   {id:'spinach-kit',name:'Spinach salad kit',brand:'Fresh produce',size:'300 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'bag',keywords:'salad kit spinach',edible:true,photo:'spinach salad kit'},
   {id:'sprouts',name:'Bean sprouts',brand:'Fresh produce',size:'300 g',departmentId:'produce',department:'Produce',aisleId:'salads',aisle:'Packaged salads',shape:'leafy',keywords:'sprouts bean',edible:true,photo:'bean sprouts'},
  ]},
 ]},
 {id:'dairy',name:'Dairy & eggs',edible:true,aisles:[
  {id:'milk-aisle',name:'Milk',departmentId:'dairy',items:[
   {id:'milk',name:'2% milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'jug',keywords:'milk 2%',edible:true,photo:'milk'},
   {id:'milk-store',name:'2% milk',brand:'Store brand',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'jug',keywords:'milk 2% store brand',edible:true,photo:'milk'},
   {id:'milk-whole',name:'Homogenized milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'jug',keywords:'milk whole homo 3.25%',edible:true,photo:'homogenized milk'},
   {id:'milk-skim',name:'Skim milk',brand:'Neilson',size:'4 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'jug',keywords:'milk skim fat free',edible:true,photo:'skim milk'},
   {id:'milk-choc',name:'Chocolate milk',brand:'Neilson',size:'1 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'carton',keywords:'chocolate milk',edible:true,photo:'chocolate milk'},
   {id:'lactose-free',name:'Lactose-free milk',brand:'Natrel',size:'2 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'carton',keywords:'lactose free milk',edible:true,photo:'lactose free milk'},
   {id:'buttermilk',name:'Buttermilk',brand:'Neilson',size:'1 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'carton',keywords:'buttermilk baking',edible:true,photo:'buttermilk',alsoIn:['baking']},
   {id:'evaporated-milk',name:'Evaporated milk',brand:'Carnation',size:'354 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'milk-aisle',aisle:'Milk',shape:'can',keywords:'evaporated milk canned',edible:true,photo:'evaporated milk'},
  ]},
  {id:'cheese-aisle',name:'Cheese',departmentId:'dairy',items:[
   {id:'cheese',name:'Old cheddar',brand:'Black Diamond',size:'400 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'cheese',keywords:'cheese cheddar old',edible:true,photo:'old cheddar'},
   {id:'cheese-mild',name:'Mild cheddar',brand:'Black Diamond',size:'400 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'cheese',keywords:'cheese cheddar mild',edible:true,photo:'mild cheddar'},
   {id:'mozzarella',name:'Mozzarella',brand:'Saputo',size:'320 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'cheese',keywords:'cheese mozzarella',edible:true,photo:'mozzarella'},
   {id:'shredded-cheese',name:'Shredded cheese blend',brand:'Armstrong',size:'320 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'bag',keywords:'cheese shredded pizza',edible:true,photo:'shredded cheese blend'},
   {id:'parmesan',name:'Grated parmesan',brand:'Kraft',size:'250 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'jar',keywords:'cheese parmesan grated',edible:true,photo:'grated parmesan'},
   {id:'cream-cheese',name:'Cream cheese',brand:'Philadelphia',size:'250 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'tub',keywords:'cream cheese spread',edible:true,photo:'cream cheese'},
   {id:'feta',name:'Feta cheese',brand:'Krinos',size:'200 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'tub',keywords:'cheese feta',edible:true,photo:'feta cheese'},
   {id:'swiss',name:'Swiss cheese slices',brand:'Black Diamond',size:'240 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'deli',keywords:'cheese swiss slices',edible:true,photo:'swiss cheese slices'},
   {id:'cottage-cheese',name:'Cottage cheese',brand:'Sealtest',size:'500 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'tub',keywords:'cottage cheese',edible:true,photo:'cottage cheese'},
   {id:'ricotta',name:'Ricotta cheese',brand:'Tre Stelle',size:'475 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'tub',keywords:'cheese ricotta',edible:true,photo:'ricotta cheese'},
   {id:'goat-cheese',name:'Goat cheese',brand:'Woolwich',size:'113 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'bar',keywords:'cheese goat chevre',edible:true,photo:'goat cheese'},
   {id:'brie',name:'Brie',brand:'Alexis de Portneuf',size:'125 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'cheese',keywords:'cheese brie soft',edible:true,photo:'brie'},
   {id:'string-cheese',name:'Cheese strings',brand:'Black Diamond',size:'16 sticks',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'box',keywords:'cheese strings snack kids',edible:true,photo:'cheese strings',alsoIn:['dried-fruit']},
   {id:'havarti',name:'Havarti slices',brand:'Castello',size:'150 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cheese-aisle',aisle:'Cheese',shape:'deli',keywords:'cheese havarti slices',edible:true,photo:'havarti slices'},
  ]},
  {id:'yogurt-aisle',name:'Yogurt',departmentId:'dairy',items:[
   {id:'yogurt',name:'Vanilla Greek yogurt',brand:'Oikos',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'tub',keywords:'yogurt greek vanilla',edible:true,photo:'vanilla greek yogurt'},
   {id:'yogurt-store',name:'Vanilla Greek yogurt',brand:'Store brand',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'tub',keywords:'yogurt greek vanilla store',edible:true,photo:'vanilla greek yogurt'},
   {id:'yogurt-plain',name:'Plain yogurt',brand:'Astro',size:'750 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'tub',keywords:'yogurt plain natural',edible:true,photo:'plain yogurt'},
   {id:'yogurt-tubes',name:'Yogurt tubes',brand:'Yoplait',size:'8 × 60 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'box',keywords:'yogurt tubes kids',edible:true,photo:'yogurt tubes'},
   {id:'skyr',name:'Icelandic skyr',brand:'Ísey',size:'500 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'tub',keywords:'skyr yogurt protein',edible:true,photo:'icelandic skyr'},
   {id:'kefir',name:'Plain kefir',brand:'Liberté',size:'1 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'carton',keywords:'kefir drinkable yogurt',edible:true,photo:'plain kefir'},
   {id:'yogurt-drink',name:'Drinkable yogurt',brand:'Danone',size:'6 × 93 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'box',keywords:'yogurt drink smoothie kids',edible:true,photo:'drinkable yogurt'},
   {id:'pudding-cups',name:'Pudding cups',brand:'Snack Pack',size:'4 × 99 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'yogurt-aisle',aisle:'Yogurt',shape:'tub',keywords:'pudding cups dessert',edible:true,photo:'pudding cups',alsoIn:['ice-cream']},
  ]},
  {id:'butter-aisle',name:'Butter & margarine',departmentId:'dairy',items:[
   {id:'butter',name:'Salted butter',brand:'Lactantia',size:'454 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',shape:'bar',keywords:'butter salted',edible:true,photo:'salted butter'},
   {id:'butter-unsalted',name:'Unsalted butter',brand:'Lactantia',size:'454 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',shape:'bar',keywords:'butter unsalted baking',edible:true,photo:'unsalted butter'},
   {id:'margarine',name:'Soft margarine',brand:'Becel',size:'907 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'butter-aisle',aisle:'Butter & margarine',shape:'tub',keywords:'margarine becel spread',edible:true,photo:'soft margarine'},
  ]},
  {id:'eggs-aisle',name:'Eggs',departmentId:'dairy',items:[
   {id:'eggs',name:'Large eggs',brand:'Burnbrae Farms',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',shape:'egg',keywords:'eggs large dozen',edible:true,photo:'large eggs'},
   {id:'eggs-store',name:'Large eggs',brand:'Store brand',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',shape:'egg',keywords:'eggs large dozen store',edible:true,photo:'large eggs'},
   {id:'eggs-free-run',name:'Free-run eggs',brand:'Burnbrae Farms',size:'12 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',shape:'egg',keywords:'eggs free run',edible:true,photo:'free run eggs'},
   {id:'egg-whites',name:'Liquid egg whites',brand:'Naturegg',size:'500 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',shape:'carton',keywords:'egg whites liquid',edible:true,photo:'liquid egg whites'},
   {id:'eggs-large-18',name:'Large eggs',brand:'Burnbrae Farms',size:'18 eggs',departmentId:'dairy',department:'Dairy & eggs',aisleId:'eggs-aisle',aisle:'Eggs',shape:'egg',keywords:'eggs large 18 flat',edible:true,photo:'large eggs'},
  ]},
  {id:'cream-aisle',name:'Cream & sour cream',departmentId:'dairy',items:[
   {id:'cream-35',name:'Whipping cream 35%',brand:'Lactantia',size:'473 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',shape:'carton',keywords:'cream whipping heavy 35',edible:true,photo:'whipping cream'},
   {id:'half-and-half',name:'Half and half 10%',brand:'Lactantia',size:'473 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',shape:'carton',keywords:'cream half coffee 10',edible:true,photo:'half half'},
   {id:'sour-cream',name:'Sour cream',brand:'Sealtest',size:'500 mL',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',shape:'tub',keywords:'sour cream',edible:true,photo:'sour cream'},
   {id:'whipped-cream',name:'Aerosol whipped cream',brand:'Reddi-wip',size:'225 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'cream-aisle',aisle:'Cream & sour cream',shape:'spray',keywords:'whipped cream aerosol',edible:true,photo:'aerosol whipped cream'},
  ]},
  {id:'alternatives',name:'Dairy alternatives',departmentId:'dairy',items:[
   {id:'oat-milk',name:'Original oat beverage',brand:'Earth’s Own',size:'1.75 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',shape:'carton',keywords:'oat milk beverage',edible:true,photo:'original oat beverage'},
   {id:'almond-milk',name:'Unsweetened almond beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',shape:'carton',keywords:'almond milk beverage',edible:true,photo:'unsweetened almond beverage'},
   {id:'soy-milk',name:'Original soy beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',shape:'carton',keywords:'soy milk beverage',edible:true,photo:'original soy beverage'},
   {id:'coconut-milk-bev',name:'Coconut beverage',brand:'Silk',size:'1.89 L',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',shape:'carton',keywords:'coconut milk beverage',edible:true,photo:'coconut beverage'},
   {id:'vegan-cheese',name:'Plant-based cheese shreds',brand:'Daiya',size:'200 g',departmentId:'dairy',department:'Dairy & eggs',aisleId:'alternatives',aisle:'Dairy alternatives',shape:'bag',keywords:'vegan cheese dairy free',edible:true,photo:'plant based cheese shreds'},
  ]},
 ]},
 {id:'meat',name:'Meat & protein',edible:true,aisles:[
  {id:'poultry',name:'Chicken & turkey',departmentId:'meat',items:[
   {id:'chicken',name:'Chicken breasts',brand:'Fresh, boneless',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'chicken breast boneless',edible:true,photo:'chicken breasts'},
   {id:'chicken-thighs',name:'Chicken thighs',brand:'Fresh, boneless',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'chicken thighs',edible:true,photo:'chicken thighs'},
   {id:'chicken-drumsticks',name:'Chicken drumsticks',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'chicken drumsticks legs',edible:true,photo:'chicken drumsticks'},
   {id:'whole-chicken',name:'Whole chicken',brand:'Fresh',size:'1.5 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'chicken whole roasting',edible:true,photo:'whole chicken'},
   {id:'ground-chicken',name:'Ground chicken',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'tray',keywords:'ground chicken mince',edible:true,photo:'ground chicken'},
   {id:'ground-turkey',name:'Ground turkey',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'tray',keywords:'ground turkey mince',edible:true,photo:'ground turkey'},
   {id:'chicken-wings',name:'Chicken wings',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'chicken wings',edible:true,photo:'chicken wings'},
   {id:'rotisserie-chicken',name:'Rotisserie chicken',brand:'Hot deli',size:'Each',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'rotisserie chicken cooked hot',edible:true,photo:'rotisserie chicken',alsoIn:['hot-food']},
   {id:'turkey-breast',name:'Turkey breast',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'poultry',aisle:'Chicken & turkey',shape:'poultry',keywords:'turkey breast',edible:true,photo:'turkey breast'},
  ]},
  {id:'beef-aisle',name:'Beef',departmentId:'meat',items:[
   {id:'beef',name:'Lean ground beef',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'tray',keywords:'ground beef mince lean',edible:true,photo:'lean ground beef'},
   {id:'beef-extra-lean',name:'Extra lean ground beef',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'tray',keywords:'ground beef extra lean',edible:true,photo:'extra lean ground beef'},
   {id:'striploin',name:'Striploin steak',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'steak',keywords:'steak striploin beef',edible:true,photo:'striploin steak'},
   {id:'ribeye',name:'Ribeye steak',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'steak',keywords:'steak ribeye beef',edible:true,photo:'ribeye steak'},
   {id:'stewing-beef',name:'Stewing beef',brand:'Fresh',size:'700 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'tray',keywords:'stewing beef cubes stew',edible:true,photo:'stewing beef'},
   {id:'beef-roast',name:'Beef roast',brand:'Fresh',size:'1.2 kg',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'steak',keywords:'roast beef',edible:true,photo:'beef roast'},
   {id:'beef-liver',name:'Beef liver',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'beef-aisle',aisle:'Beef',shape:'steak',keywords:'liver beef offal',edible:true,photo:'beef liver'},
  ]},
  {id:'pork-aisle',name:'Pork',departmentId:'meat',items:[
   {id:'pork-chops',name:'Pork chops',brand:'Fresh',size:'600 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'steak',keywords:'pork chops',edible:true,photo:'pork chops'},
   {id:'pork-tenderloin',name:'Pork tenderloin',brand:'Fresh',size:'700 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'steak',keywords:'pork tenderloin',edible:true,photo:'pork tenderloin'},
   {id:'ground-pork',name:'Ground pork',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'tray',keywords:'ground pork mince',edible:true,photo:'ground pork'},
   {id:'bacon',name:'Bacon',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'bacon',keywords:'bacon strips',edible:true,photo:'bacon'},
   {id:'sausages',name:'Breakfast sausages',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'sausage',keywords:'sausage sausages breakfast',edible:true,photo:'breakfast sausages'},
   {id:'italian-sausage',name:'Italian sausage',brand:'Fresh',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'sausage',keywords:'sausage italian',edible:true,photo:'italian sausage'},
   {id:'ham-steak',name:'Ham steak',brand:'Maple Leaf',size:'375 g',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'steak',keywords:'ham steak',edible:true,photo:'ham steak'},
   {id:'pork-ribs',name:'Pork back ribs',brand:'Fresh',size:'1 kg',departmentId:'meat',department:'Meat & protein',aisleId:'pork-aisle',aisle:'Pork',shape:'steak',keywords:'ribs pork back',edible:true,photo:'pork back ribs'},
  ]},
  {id:'seafood',name:'Fish & seafood',departmentId:'meat',items:[
   {id:'salmon',name:'Atlantic salmon',brand:'Fresh fillet',size:'500 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'salmon fillet fish',edible:true,photo:'atlantic salmon'},
   {id:'tilapia',name:'Tilapia fillets',brand:'Frozen',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'tilapia fish fillet',edible:true,photo:'tilapia fillets'},
   {id:'cod',name:'Cod fillets',brand:'Frozen',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'cod fish fillet',edible:true,photo:'cod fillets'},
   {id:'haddock',name:'Haddock fillets',brand:'Fresh',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'haddock fish',edible:true,photo:'haddock fillets'},
   {id:'shrimp',name:'Raw shrimp',brand:'Frozen',size:'340 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'shrimp',keywords:'shrimp prawns',edible:true,photo:'raw shrimp'},
   {id:'tuna-steak',name:'Tuna steak',brand:'Frozen',size:'300 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'tuna steak fish',edible:true,photo:'tuna steak'},
   {id:'mussels',name:'Fresh mussels',brand:'Fresh',size:'907 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'shrimp',keywords:'mussels shellfish',edible:true,photo:'mussels'},
   {id:'smoked-salmon',name:'Smoked salmon',brand:'Fresh',size:'140 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'fillet',keywords:'smoked salmon lox',edible:true,photo:'smoked salmon'},
   {id:'scallops',name:'Sea scallops',brand:'Frozen',size:'340 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'shrimp',keywords:'scallops shellfish',edible:true,photo:'sea scallops'},
   {id:'crab-meat',name:'Crab meat',brand:'Frozen',size:'227 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'shrimp',keywords:'crab meat shellfish',edible:true,photo:'crab meat'},
   {id:'fish-cakes',name:'Salmon cakes',brand:'Frozen',size:'400 g',departmentId:'meat',department:'Meat & protein',aisleId:'seafood',aisle:'Fish & seafood',shape:'tray',keywords:'fish cakes salmon patties',edible:true,photo:'salmon cakes'},
  ]},
  {id:'deli',name:'Deli & cured',departmentId:'meat',items:[
   {id:'deli-turkey',name:'Sliced turkey breast',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',shape:'deli',keywords:'deli turkey sliced',edible:true,photo:'sliced turkey breast'},
   {id:'deli-ham',name:'Black forest ham',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',shape:'deli',keywords:'deli ham sliced',edible:true,photo:'black forest ham'},
   {id:'salami',name:'Genoa salami',brand:'Schneiders',size:'175 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',shape:'deli',keywords:'salami deli',edible:true,photo:'genoa salami'},
   {id:'pepperoni',name:'Pepperoni',brand:'Schneiders',size:'250 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',shape:'deli',keywords:'pepperoni pizza',edible:true,photo:'pepperoni'},
   {id:'hot-dogs',name:'Wieners',brand:'Maple Leaf',size:'450 g',departmentId:'meat',department:'Meat & protein',aisleId:'deli',aisle:'Deli & cured',shape:'sausage',keywords:'hot dogs wieners franks',edible:true,photo:'wieners'},
  ]},
  {id:'plant-protein',name:'Plant-based protein',departmentId:'meat',items:[
   {id:'tofu',name:'Extra firm tofu',brand:'Sunrise',size:'350 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',shape:'box',keywords:'tofu soy protein',edible:true,photo:'extra firm tofu'},
   {id:'tempeh',name:'Organic tempeh',brand:'Noble Bean',size:'240 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',shape:'box',keywords:'tempeh soy protein',edible:true,photo:'organic tempeh'},
   {id:'veggie-burgers',name:'Plant-based burgers',brand:'Beyond Meat',size:'2 × 113 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',shape:'box',keywords:'veggie burger plant based',edible:true,photo:'plant based burgers',alsoIn:['frozen-meals']},
   {id:'veggie-ground',name:'Plant-based ground',brand:'Yves',size:'340 g',departmentId:'meat',department:'Meat & protein',aisleId:'plant-protein',aisle:'Plant-based protein',shape:'tray',keywords:'veggie ground plant based',edible:true,photo:'plant based ground'},
  ]},
 ]},
 {id:'deli',name:'Deli & prepared',edible:true,aisles:[
  {id:'hot-food',name:'Hot food counter',departmentId:'deli',items:[
   {id:'hot-wings',name:'Hot chicken wings',brand:'Hot deli',size:'500 g',departmentId:'deli',department:'Deli & prepared',aisleId:'hot-food',aisle:'Hot food counter',shape:'poultry',keywords:'hot wings deli prepared',edible:true,photo:'chicken wings'},
   {id:'mac-cheese-prepared',name:'Macaroni and cheese',brand:'Prepared',size:'750 g',departmentId:'deli',department:'Deli & prepared',aisleId:'hot-food',aisle:'Hot food counter',shape:'tray',keywords:'mac and cheese prepared hot',edible:true,photo:'macaroni cheese'},
   {id:'meat-pie',name:'Chicken pot pie',brand:'Prepared',size:'500 g',departmentId:'deli',department:'Deli & prepared',aisleId:'hot-food',aisle:'Hot food counter',shape:'pastry',keywords:'pot pie prepared',edible:true,photo:'chicken pot pie',alsoIn:['poultry']},
  ]},
  {id:'deli-salads',name:'Deli salads & dips',departmentId:'deli',items:[
   {id:'potato-salad',name:'Potato salad',brand:'Deli',size:'500 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'potato salad deli',edible:true,photo:'potato salad'},
   {id:'hummus',name:'Hummus',brand:'Sabra',size:'280 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'hummus dip chickpea',edible:true,photo:'hummus',alsoIn:['condiments']},
   {id:'tzatziki',name:'Tzatziki dip',brand:'Krinos',size:'250 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'tzatziki dip greek',edible:true,photo:'tzatziki dip',alsoIn:['condiments']},
   {id:'guacamole',name:'Guacamole',brand:'Yucatan',size:'227 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'guacamole dip avocado',edible:true,photo:'guacamole',alsoIn:['condiments']},
   {id:'spinach-dip',name:'Spinach dip',brand:'Deli',size:'250 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'spinach dip party',edible:true,photo:'spinach dip'},
   {id:'coleslaw-deli',name:'Creamy coleslaw',brand:'Deli',size:'500 g',departmentId:'deli',department:'Deli & prepared',aisleId:'deli-salads',aisle:'Deli salads & dips',shape:'tub',keywords:'coleslaw deli salad',edible:true,photo:'creamy coleslaw'},
  ]},
  {id:'prepared-meals',name:'Prepared meals',departmentId:'deli',items:[
   {id:'sushi',name:'Sushi tray',brand:'Prepared',size:'300 g',departmentId:'deli',department:'Deli & prepared',aisleId:'prepared-meals',aisle:'Prepared meals',shape:'tray',keywords:'sushi prepared tray',edible:true,photo:'sushi tray'},
   {id:'sandwich',name:'Deli sandwich',brand:'Prepared',size:'Each',departmentId:'deli',department:'Deli & prepared',aisleId:'prepared-meals',aisle:'Prepared meals',shape:'bun',keywords:'sandwich prepared lunch',edible:true,photo:'deli sandwich'},
   {id:'pizza-slice',name:'Prepared pizza',brand:'Hot deli',size:'Each',departmentId:'deli',department:'Deli & prepared',aisleId:'prepared-meals',aisle:'Prepared meals',shape:'pizza',keywords:'pizza prepared hot',edible:true,photo:'prepared pizza'},
   {id:'salad-bowl',name:'Prepared salad bowl',brand:'Prepared',size:'350 g',departmentId:'deli',department:'Deli & prepared',aisleId:'prepared-meals',aisle:'Prepared meals',shape:'tray',keywords:'salad bowl prepared lunch',edible:true,photo:'salad bowl'},
   {id:'soup-prepared',name:'Fresh soup',brand:'Prepared',size:'650 mL',departmentId:'deli',department:'Deli & prepared',aisleId:'prepared-meals',aisle:'Prepared meals',shape:'tub',keywords:'soup fresh prepared',edible:true,photo:'fresh soup'},
  ]},
 ]},
 {id:'bakery',name:'Bakery',edible:true,aisles:[
  {id:'bread-aisle',name:'Bread',departmentId:'bakery',items:[
   {id:'bread',name:'Whole wheat bread',brand:'Dempster’s',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread whole wheat loaf',edible:true,photo:'whole wheat bread'},
   {id:'bread-store',name:'Whole wheat bread',brand:'Store brand',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread whole wheat store',edible:true,photo:'whole wheat bread'},
   {id:'white-bread',name:'White bread',brand:'Wonder',size:'675 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread white loaf',edible:true,photo:'white bread'},
   {id:'multigrain-bread',name:'12 grain bread',brand:'Dempster’s',size:'600 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread multigrain 12 grain',edible:true,photo:'grain bread'},
   {id:'sourdough',name:'Sourdough loaf',brand:'In-store bakery',size:'500 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread sourdough',edible:true,photo:'sourdough loaf'},
   {id:'rye-bread',name:'Rye bread',brand:'Dimpflmeier',size:'680 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread rye',edible:true,photo:'rye bread'},
   {id:'baguette',name:'French baguette',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'baguette',keywords:'baguette french stick',edible:true,photo:'french baguette',alsoIn:['sweet-bakery']},
   {id:'gluten-free-bread',name:'Gluten-free bread',brand:'Udi’s',size:'340 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'bread gluten free',edible:true,photo:'gluten free bread'},
   {id:'focaccia',name:'Focaccia',brand:'In-store bakery',size:'400 g',departmentId:'bakery',department:'Bakery',aisleId:'bread-aisle',aisle:'Bread',shape:'loaf',keywords:'focaccia italian flatbread',edible:true,photo:'focaccia',alsoIn:['tortillas']},
  ]},
  {id:'buns',name:'Buns & rolls',departmentId:'bakery',items:[
   {id:'hamburger-buns',name:'Hamburger buns',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',shape:'bun',keywords:'buns hamburger',edible:true,photo:'hamburger buns'},
   {id:'hot-dog-buns',name:'Hot dog buns',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',shape:'bun',keywords:'buns hot dog',edible:true,photo:'hot dog buns'},
   {id:'dinner-rolls',name:'Dinner rolls',brand:'In-store bakery',size:'Pack of 12',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',shape:'bun',keywords:'rolls dinner',edible:true,photo:'dinner rolls'},
   {id:'kaiser-rolls',name:'Kaiser rolls',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'buns',aisle:'Buns & rolls',shape:'bun',keywords:'rolls kaiser buns',edible:true,photo:'kaiser rolls'},
  ]},
  {id:'bagels',name:'Bagels & English muffins',departmentId:'bakery',items:[
   {id:'bagels',name:'Plain bagels',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & English muffins',shape:'bagel',keywords:'bagels plain',edible:true,photo:'plain bagels'},
   {id:'everything-bagels',name:'Everything bagels',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & English muffins',shape:'bagel',keywords:'bagels everything',edible:true,photo:'everything bagels'},
   {id:'english-muffins',name:'English muffins',brand:'Dempster’s',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'bagels',aisle:'Bagels & English muffins',shape:'bun',keywords:'english muffins',edible:true,photo:'english muffins'},
  ]},
  {id:'tortillas',name:'Tortillas & flatbread',departmentId:'bakery',items:[
   {id:'tortillas',name:'Flour tortillas',brand:'Old El Paso',size:'10 × 25 cm',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',shape:'tortilla',keywords:'tortillas wraps flour',edible:true,photo:'flour tortillas'},
   {id:'whole-wheat-wraps',name:'Whole wheat wraps',brand:'Dempster’s',size:'Pack of 8',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',shape:'tortilla',keywords:'wraps whole wheat tortilla',edible:true,photo:'whole wheat wraps'},
   {id:'pita',name:'Greek pita',brand:'Kontos',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',shape:'tortilla',keywords:'pita flatbread',edible:true,photo:'greek pita'},
   {id:'naan',name:'Naan bread',brand:'Stonefire',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'tortillas',aisle:'Tortillas & flatbread',shape:'tortilla',keywords:'naan flatbread indian',edible:true,photo:'naan bread'},
  ]},
  {id:'sweet-bakery',name:'Sweet bakery',departmentId:'bakery',items:[
   {id:'muffins',name:'Blueberry muffins',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'pastry',keywords:'muffins blueberry',edible:true,photo:'blueberry muffins',alsoIn:['bagels']},
   {id:'donuts',name:'Assorted donuts',brand:'In-store bakery',size:'Pack of 6',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'pastry',keywords:'donuts doughnuts',edible:true,photo:'assorted donuts'},
   {id:'cinnamon-buns',name:'Cinnamon buns',brand:'In-store bakery',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'pastry',keywords:'cinnamon buns rolls',edible:true,photo:'cinnamon buns',alsoIn:['buns']},
   {id:'cake',name:'Vanilla layer cake',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'pastry',keywords:'cake birthday vanilla',edible:true,photo:'vanilla layer cake'},
   {id:'apple-pie',name:'Apple pie',brand:'In-store bakery',size:'Each',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'pastry',keywords:'pie apple dessert',edible:true,photo:'apple pie'},
   {id:'pie-crust',name:'Frozen pie shells',brand:'Tenderflake',size:'2 shells',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'tray',keywords:'pie crust shells pastry',edible:true,photo:'frozen pie shells'},
   {id:'croissants',name:'Butter croissants',brand:'In-store bakery',size:'Pack of 4',departmentId:'bakery',department:'Bakery',aisleId:'sweet-bakery',aisle:'Sweet bakery',shape:'croissant',keywords:'croissants pastry',edible:true,photo:'butter croissants'},
  ]},
 ]},
 {id:'pantry',name:'Pantry',edible:true,aisles:[
  {id:'pasta-aisle',name:'Pasta & noodles',departmentId:'pantry',items:[
   {id:'pasta',name:'Spaghetti',brand:'Barilla',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta spaghetti',edible:true,photo:'spaghetti'},
   {id:'pasta-store',name:'Spaghetti',brand:'Store brand',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta spaghetti store',edible:true,photo:'spaghetti'},
   {id:'penne',name:'Penne rigate',brand:'Barilla',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta penne',edible:true,photo:'penne rigate'},
   {id:'fusilli',name:'Fusilli',brand:'Catelli',size:'410 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta fusilli rotini',edible:true,photo:'fusilli'},
   {id:'macaroni',name:'Elbow macaroni',brand:'Catelli',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'bag',keywords:'pasta macaroni elbow',edible:true,photo:'elbow macaroni'},
   {id:'lasagna-noodles',name:'Lasagna noodles',brand:'Catelli',size:'375 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta lasagna noodles',edible:true,photo:'lasagna noodles'},
   {id:'egg-noodles',name:'Broad egg noodles',brand:'No Name',size:'340 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'bag',keywords:'noodles egg',edible:true,photo:'broad egg noodles'},
   {id:'ramen',name:'Instant ramen',brand:'Nissin',size:'5 × 85 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'pouch',keywords:'ramen noodles instant',edible:true,photo:'instant ramen'},
   {id:'rice-noodles',name:'Rice vermicelli',brand:'Thai Kitchen',size:'200 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'bag',keywords:'rice noodles vermicelli',edible:true,photo:'rice vermicelli'},
   {id:'gnocchi',name:'Potato gnocchi',brand:'Olivieri',size:'350 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'pouch',keywords:'gnocchi pasta potato',edible:true,photo:'potato gnocchi'},
   {id:'fresh-pasta',name:'Fresh tortellini',brand:'Olivieri',size:'350 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'pouch',keywords:'tortellini fresh pasta filled',edible:true,photo:'fresh tortellini'},
   {id:'gluten-free-pasta',name:'Gluten-free penne',brand:'Catelli',size:'340 g',departmentId:'pantry',department:'Pantry',aisleId:'pasta-aisle',aisle:'Pasta & noodles',shape:'box',keywords:'pasta gluten free',edible:true,photo:'gluten free penne'},
  ]},
  {id:'rice-grains',name:'Rice & grains',departmentId:'pantry',items:[
   {id:'rice',name:'Jasmine rice',brand:'Rooster',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'rice jasmine',edible:true,photo:'jasmine rice'},
   {id:'rice-store',name:'Jasmine rice',brand:'Store brand',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'rice jasmine store',edible:true,photo:'jasmine rice'},
   {id:'basmati',name:'Basmati rice',brand:'Dawat',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'rice basmati',edible:true,photo:'basmati rice'},
   {id:'brown-rice',name:'Long grain brown rice',brand:'Uncle Ben’s',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'box',keywords:'rice brown',edible:true,photo:'long grain brown rice'},
   {id:'quinoa',name:'White quinoa',brand:'GoGo Quinoa',size:'750 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'quinoa grain',edible:true,photo:'white quinoa'},
   {id:'couscous',name:'Couscous',brand:'Aurora',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'box',keywords:'couscous grain',edible:true,photo:'couscous'},
   {id:'barley',name:'Pearl barley',brand:'No Name',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'barley grain soup',edible:true,photo:'pearl barley'},
   {id:'polenta',name:'Polenta',brand:'Beretta',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'rice-grains',aisle:'Rice & grains',shape:'bag',keywords:'polenta cornmeal italian',edible:true,photo:'polenta'},
  ]},
  {id:'canned-veg',name:'Canned vegetables',departmentId:'pantry',items:[
   {id:'canned-tomatoes',name:'Diced tomatoes',brand:'Aylmer',size:'796 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'canned tomatoes diced',edible:true,photo:'diced tomatoes',alsoIn:['sauces']},
   {id:'tomato-paste',name:'Tomato paste',brand:'Hunt’s',size:'156 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'tomato paste',edible:true,photo:'tomato paste',alsoIn:['sauces']},
   {id:'crushed-tomatoes',name:'Crushed tomatoes',brand:'Aylmer',size:'796 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'canned tomatoes crushed',edible:true,photo:'crushed tomatoes',alsoIn:['sauces']},
   {id:'canned-corn',name:'Whole kernel corn',brand:'Green Giant',size:'341 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'canned corn',edible:true,photo:'whole kernel corn'},
   {id:'canned-peas',name:'Sweet peas',brand:'Green Giant',size:'398 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'canned peas',edible:true,photo:'sweet peas'},
   {id:'canned-mushrooms',name:'Sliced mushrooms',brand:'Money’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'canned mushrooms',edible:true,photo:'sliced mushrooms'},
   {id:'olives',name:'Sliced black olives',brand:'Unico',size:'375 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'jar',keywords:'olives black',edible:true,photo:'sliced black olives',alsoIn:['condiments']},
   {id:'pickles',name:'Dill pickles',brand:'Bick’s',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'jar',keywords:'pickles dill',edible:true,photo:'dill pickles',alsoIn:['condiments']},
   {id:'coconut-milk',name:'Coconut milk',brand:'Thai Kitchen',size:'400 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'can',keywords:'coconut milk canned curry',edible:true,photo:'coconut milk',alsoIn:['world-foods']},
   {id:'capers',name:'Capers',brand:'Unico',size:'250 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'jar',keywords:'capers',edible:true,photo:'capers',alsoIn:['condiments']},
   {id:'sauerkraut',name:'Sauerkraut',brand:'Bick’s',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'canned-veg',aisle:'Canned vegetables',shape:'jar',keywords:'sauerkraut fermented cabbage',edible:true,photo:'sauerkraut',alsoIn:['condiments']},
  ]},
  {id:'canned-protein',name:'Canned fish & meat',departmentId:'pantry',items:[
   {id:'tuna-canned',name:'Flaked light tuna',brand:'Clover Leaf',size:'170 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',shape:'can',keywords:'tuna canned',edible:true,photo:'flaked light tuna'},
   {id:'salmon-canned',name:'Sockeye salmon',brand:'Clover Leaf',size:'213 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',shape:'can',keywords:'salmon canned',edible:true,photo:'sockeye salmon'},
   {id:'sardines',name:'Sardines in oil',brand:'Brunswick',size:'106 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',shape:'can',keywords:'sardines canned',edible:true,photo:'sardines in oil'},
   {id:'canned-chicken',name:'Flaked chicken',brand:'No Name',size:'200 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',shape:'can',keywords:'canned chicken',edible:true,photo:'flaked chicken'},
   {id:'anchovies',name:'Anchovy fillets',brand:'Unico',size:'50 g',departmentId:'pantry',department:'Pantry',aisleId:'canned-protein',aisle:'Canned fish & meat',shape:'can',keywords:'anchovies canned',edible:true,photo:'anchovy fillets'},
  ]},
  {id:'beans-aisle',name:'Beans & lentils',departmentId:'pantry',items:[
   {id:'beans',name:'Black beans',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'can',keywords:'beans black canned',edible:true,photo:'black beans'},
   {id:'chickpeas',name:'Chickpeas',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'can',keywords:'chickpeas garbanzo',edible:true,photo:'chickpeas'},
   {id:'kidney-beans',name:'Red kidney beans',brand:'Unico',size:'540 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'can',keywords:'beans kidney red',edible:true,photo:'red kidney beans'},
   {id:'baked-beans',name:'Beans in tomato sauce',brand:'Heinz',size:'398 mL',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'can',keywords:'baked beans',edible:true,photo:'beans in tomato sauce'},
   {id:'lentils',name:'Dry green lentils',brand:'No Name',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'bag',keywords:'lentils dry',edible:true,photo:'dry green lentils'},
   {id:'split-peas',name:'Yellow split peas',brand:'No Name',size:'900 g',departmentId:'pantry',department:'Pantry',aisleId:'beans-aisle',aisle:'Beans & lentils',shape:'bag',keywords:'split peas dry',edible:true,photo:'yellow split peas'},
  ]},
  {id:'soup-broth',name:'Soup & broth',departmentId:'pantry',items:[
   {id:'chicken-soup',name:'Chicken noodle soup',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'can',keywords:'soup chicken noodle',edible:true,photo:'chicken noodle soup'},
   {id:'tomato-soup',name:'Tomato soup',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'can',keywords:'soup tomato',edible:true,photo:'tomato soup'},
   {id:'mushroom-soup',name:'Cream of mushroom',brand:'Campbell’s',size:'284 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'can',keywords:'soup mushroom cream',edible:true,photo:'cream mushroom'},
   {id:'chicken-broth',name:'Chicken broth',brand:'Campbell’s',size:'900 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'carton',keywords:'broth stock chicken',edible:true,photo:'chicken broth'},
   {id:'veg-broth',name:'Vegetable broth',brand:'Imagine',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'carton',keywords:'broth stock vegetable',edible:true,photo:'vegetable broth'},
   {id:'beef-broth',name:'Beef broth',brand:'Campbell’s',size:'900 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'carton',keywords:'broth stock beef',edible:true,photo:'beef broth'},
   {id:'ramen-cups',name:'Cup noodles',brand:'Nissin',size:'6 × 64 g',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'pouch',keywords:'cup noodles instant soup',edible:true,photo:'cup noodles'},
   {id:'bone-broth',name:'Bone broth',brand:'Kettle & Fire',size:'480 mL',departmentId:'pantry',department:'Pantry',aisleId:'soup-broth',aisle:'Soup & broth',shape:'carton',keywords:'bone broth',edible:true,photo:'bone broth'},
  ]},
  {id:'sauces',name:'Cooking sauces',departmentId:'pantry',items:[
   {id:'sauce',name:'Tomato pasta sauce',brand:'Classico',size:'650 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'jar',keywords:'pasta sauce tomato marinara',edible:true,photo:'tomato pasta sauce'},
   {id:'alfredo',name:'Alfredo sauce',brand:'Classico',size:'410 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'jar',keywords:'alfredo sauce white',edible:true,photo:'alfredo sauce'},
   {id:'salsa',name:'Medium salsa',brand:'Tostitos',size:'418 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'jar',keywords:'salsa dip',edible:true,photo:'medium salsa'},
   {id:'curry-sauce',name:'Butter chicken sauce',brand:'Patak’s',size:'400 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'jar',keywords:'curry sauce butter chicken',edible:true,photo:'butter chicken sauce'},
   {id:'stir-fry-sauce',name:'Stir-fry sauce',brand:'VH',size:'341 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'bottle',keywords:'stir fry sauce',edible:true,photo:'stir fry sauce'},
   {id:'pizza-sauce',name:'Pizza sauce',brand:'Unico',size:'213 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'can',keywords:'pizza sauce',edible:true,photo:'pizza sauce'},
   {id:'gravy-mix',name:'Gravy mix',brand:'Club House',size:'25 g',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'sachet',keywords:'gravy mix',edible:true,photo:'gravy mix'},
   {id:'marinade',name:'Steak marinade',brand:'Club House',size:'355 mL',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'bottle',keywords:'marinade steak',edible:true,photo:'steak marinade'},
   {id:'miso',name:'Miso paste',brand:'Hikari',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'sauces',aisle:'Cooking sauces',shape:'tub',keywords:'miso paste japanese soup',edible:true,photo:'miso paste'},
  ]},
  {id:'oils',name:'Oils & vinegars',departmentId:'pantry',items:[
   {id:'olive-oil',name:'Extra virgin olive oil',brand:'Bertolli',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'olive oil extra virgin',edible:true,photo:'extra virgin olive oil'},
   {id:'canola-oil',name:'Canola oil',brand:'No Name',size:'3 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'jug',keywords:'canola oil vegetable',edible:true,photo:'canola oil'},
   {id:'vegetable-oil',name:'Vegetable oil',brand:'Mazola',size:'1.42 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'vegetable oil',edible:true,photo:'vegetable oil'},
   {id:'coconut-oil',name:'Coconut oil',brand:'Nutiva',size:'414 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'jar',keywords:'coconut oil',edible:true,photo:'coconut oil'},
   {id:'white-vinegar',name:'White vinegar',brand:'Heinz',size:'4 L',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'jug',keywords:'vinegar white cleaning',edible:true,photo:'white vinegar'},
   {id:'balsamic',name:'Balsamic vinegar',brand:'Colavita',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'vinegar balsamic',edible:true,photo:'balsamic vinegar'},
   {id:'cooking-spray',name:'Canola cooking spray',brand:'Pam',size:'170 g',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'spray',keywords:'cooking spray pam',edible:true,photo:'canola cooking spray'},
   {id:'sesame-oil',name:'Toasted sesame oil',brand:'Kadoya',size:'327 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'sesame oil asian',edible:true,photo:'toasted sesame oil'},
   {id:'rice-vinegar',name:'Rice vinegar',brand:'Marukan',size:'355 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'rice vinegar asian',edible:true,photo:'rice vinegar'},
   {id:'apple-cider-vinegar',name:'Apple cider vinegar',brand:'Bragg',size:'473 mL',departmentId:'pantry',department:'Pantry',aisleId:'oils',aisle:'Oils & vinegars',shape:'bottle',keywords:'apple cider vinegar acv',edible:true,photo:'apple cider vinegar'},
  ]},
  {id:'spices',name:'Spices & seasonings',departmentId:'pantry',items:[
   {id:'salt',name:'Table salt',brand:'Sifto',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'box',keywords:'salt',edible:true,photo:'table salt'},
   {id:'pepper',name:'Ground black pepper',brand:'Club House',size:'100 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'pepper black ground',edible:true,photo:'ground black pepper'},
   {id:'garlic-powder',name:'Garlic powder',brand:'Club House',size:'100 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'garlic powder',edible:true,photo:'garlic powder'},
   {id:'cinnamon',name:'Ground cinnamon',brand:'Club House',size:'55 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'cinnamon ground',edible:true,photo:'ground cinnamon'},
   {id:'paprika',name:'Paprika',brand:'Club House',size:'60 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'paprika',edible:true,photo:'paprika'},
   {id:'oregano',name:'Dried oregano',brand:'Club House',size:'20 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'oregano dried herb',edible:true,photo:'dried oregano'},
   {id:'chili-powder',name:'Chili powder',brand:'Club House',size:'65 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'chili powder',edible:true,photo:'chili powder'},
   {id:'cumin',name:'Ground cumin',brand:'Club House',size:'50 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'cumin ground',edible:true,photo:'ground cumin'},
   {id:'italian-seasoning',name:'Italian seasoning',brand:'Club House',size:'25 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'italian seasoning herbs',edible:true,photo:'italian seasoning'},
   {id:'bay-leaves',name:'Bay leaves',brand:'Club House',size:'5 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'bay leaves',edible:true,photo:'bay leaves'},
   {id:'curry-powder',name:'Curry powder',brand:'Club House',size:'65 g',departmentId:'pantry',department:'Pantry',aisleId:'spices',aisle:'Spices & seasonings',shape:'sachet',keywords:'curry powder indian',edible:true,photo:'curry powder'},
  ]},
  {id:'baking',name:'Baking supplies',departmentId:'pantry',items:[
   {id:'flour',name:'All purpose flour',brand:'Robin Hood',size:'2.5 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'flour all purpose baking',edible:true,photo:'all purpose flour'},
   {id:'whole-wheat-flour',name:'Whole wheat flour',brand:'Robin Hood',size:'2.5 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'flour whole wheat',edible:true,photo:'whole wheat flour'},
   {id:'sugar',name:'Granulated sugar',brand:'Redpath',size:'2 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'sugar white granulated',edible:true,photo:'granulated sugar'},
   {id:'brown-sugar',name:'Brown sugar',brand:'Redpath',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'sugar brown',edible:true,photo:'brown sugar'},
   {id:'icing-sugar',name:'Icing sugar',brand:'Redpath',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'icing sugar powdered',edible:true,photo:'icing sugar'},
   {id:'baking-soda',name:'Baking soda',brand:'Arm & Hammer',size:'500 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'box',keywords:'baking soda',edible:true,photo:'baking soda'},
   {id:'baking-powder',name:'Baking powder',brand:'Magic',size:'225 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'can',keywords:'baking powder',edible:true,photo:'baking powder'},
   {id:'vanilla',name:'Pure vanilla extract',brand:'Club House',size:'43 mL',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bottle',keywords:'vanilla extract',edible:true,photo:'pure vanilla extract'},
   {id:'chocolate-chips',name:'Semi-sweet chocolate chips',brand:'Chipits',size:'300 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'chocolate chips baking',edible:true,photo:'semi sweet chocolate chips'},
   {id:'cocoa',name:'Cocoa powder',brand:'Fry’s',size:'227 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'can',keywords:'cocoa powder baking',edible:true,photo:'cocoa powder'},
   {id:'yeast',name:'Instant yeast',brand:'Fleischmann’s',size:'8 g × 3',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'sachet',keywords:'yeast bread baking',edible:true,photo:'instant yeast'},
   {id:'cornstarch',name:'Corn starch',brand:'Canada',size:'454 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'box',keywords:'cornstarch thickener',edible:true,photo:'corn starch'},
   {id:'marshmallows',name:'Marshmallows',brand:'Jet-Puffed',size:'250 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bag',keywords:'marshmallows',edible:true,photo:'marshmallows'},
   {id:'condensed-milk',name:'Sweetened condensed milk',brand:'Eagle Brand',size:'300 mL',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'can',keywords:'condensed milk sweetened',edible:true,photo:'sweetened condensed milk'},
   {id:'molasses',name:'Fancy molasses',brand:'Crosby’s',size:'750 mL',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'bottle',keywords:'molasses',edible:true,photo:'fancy molasses'},
   {id:'breadcrumbs',name:'Italian breadcrumbs',brand:'Progresso',size:'425 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'can',keywords:'breadcrumbs panko coating',edible:true,photo:'italian breadcrumbs'},
   {id:'cake-mix',name:'Vanilla cake mix',brand:'Betty Crocker',size:'432 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'box',keywords:'cake mix baking',edible:true,photo:'vanilla cake mix'},
   {id:'jello',name:'Gelatin dessert',brand:'Jell-O',size:'85 g',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'box',keywords:'jello gelatin dessert',edible:true,photo:'gelatin dessert'},
   {id:'food-colouring',name:'Food colouring',brand:'Club House',size:'4 × 28 mL',departmentId:'pantry',department:'Pantry',aisleId:'baking',aisle:'Baking supplies',shape:'box',keywords:'food colouring dye',edible:true,photo:'food colouring'},
  ]},
  {id:'condiments',name:'Condiments',departmentId:'pantry',items:[
   {id:'ketchup',name:'Tomato ketchup',brand:'Heinz',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'ketchup',edible:true,photo:'tomato ketchup'},
   {id:'mustard',name:'Prepared mustard',brand:'French’s',size:'400 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'mustard yellow',edible:true,photo:'prepared mustard'},
   {id:'dijon',name:'Dijon mustard',brand:'Maille',size:'215 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'jar',keywords:'mustard dijon',edible:true,photo:'dijon mustard'},
   {id:'mayonnaise',name:'Real mayonnaise',brand:'Hellmann’s',size:'890 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'jar',keywords:'mayonnaise mayo',edible:true,photo:'real mayonnaise'},
   {id:'relish',name:'Sweet relish',brand:'Bick’s',size:'375 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'jar',keywords:'relish pickle',edible:true,photo:'sweet relish'},
   {id:'bbq-sauce',name:'Original BBQ sauce',brand:'Bull’s-Eye',size:'425 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'bbq sauce barbecue',edible:true,photo:'original bbq sauce'},
   {id:'hot-sauce',name:'Hot sauce',brand:'Frank’s RedHot',size:'354 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'hot sauce',edible:true,photo:'hot sauce'},
   {id:'ranch',name:'Ranch dressing',brand:'Kraft',size:'475 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'ranch dressing salad',edible:true,photo:'ranch dressing'},
   {id:'italian-dressing',name:'Italian dressing',brand:'Kraft',size:'475 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'italian dressing salad',edible:true,photo:'italian dressing'},
   {id:'tartar-sauce',name:'Tartar sauce',brand:'Kraft',size:'250 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'jar',keywords:'tartar sauce fish',edible:true,photo:'tartar sauce'},
   {id:'horseradish',name:'Prepared horseradish',brand:'Bick’s',size:'250 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'jar',keywords:'horseradish',edible:true,photo:'prepared horseradish'},
   {id:'caesar-dressing',name:'Caesar dressing',brand:'Renée’s',size:'355 mL',departmentId:'pantry',department:'Pantry',aisleId:'condiments',aisle:'Condiments',shape:'bottle',keywords:'caesar dressing salad',edible:true,photo:'caesar dressing'},
  ]},
  {id:'spreads',name:'Spreads & sweeteners',departmentId:'pantry',items:[
   {id:'peanut-butter',name:'Peanut butter',brand:'Kraft',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'peanut butter',edible:true,photo:'peanut butter'},
   {id:'almond-butter',name:'Almond butter',brand:'Kirkland',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'almond butter',edible:true,photo:'almond butter'},
   {id:'nutella',name:'Hazelnut spread',brand:'Nutella',size:'725 g',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'nutella hazelnut chocolate spread',edible:true,photo:'hazelnut spread'},
   {id:'jam',name:'Strawberry jam',brand:'Smucker’s',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'jam jelly strawberry',edible:true,photo:'strawberry jam'},
   {id:'honey',name:'Liquid honey',brand:'Billy Bee',size:'1 kg',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'honey',edible:true,photo:'liquid honey'},
   {id:'maple-syrup',name:'Pure maple syrup',brand:'Kirkland',size:'1 L',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'bottle',keywords:'maple syrup',edible:true,photo:'pure maple syrup'},
   {id:'tahini',name:'Tahini',brand:'Alwadi',size:'454 g',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'tahini sesame paste',edible:true,photo:'tahini'},
   {id:'sunflower-butter',name:'Sunflower seed butter',brand:'SunButter',size:'454 g',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'sunflower butter nut free',edible:true,photo:'sunflower seed butter'},
   {id:'marmalade',name:'Orange marmalade',brand:'Smucker’s',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'jar',keywords:'marmalade orange jam',edible:true,photo:'orange marmalade'},
   {id:'corn-syrup',name:'Corn syrup',brand:'Crown',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'spreads',aisle:'Spreads & sweeteners',shape:'bottle',keywords:'corn syrup golden',edible:true,photo:'corn syrup'},
  ]},
  {id:'world-foods',name:'International & Asian',departmentId:'pantry',items:[
   {id:'nori',name:'Sushi nori sheets',brand:'Kim Nori',size:'10 sheets',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'box',keywords:'nori seaweed sushi',edible:true,photo:'sushi sheets'},
   {id:'tortilla-shells',name:'Taco shells',brand:'Old El Paso',size:'12 shells',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'box',keywords:'taco shells mexican',edible:true,photo:'taco shells',alsoIn:['tortillas']},
   {id:'refried-beans',name:'Refried beans',brand:'Old El Paso',size:'398 mL',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'can',keywords:'refried beans mexican',edible:true,photo:'refried beans',alsoIn:['beans-aisle']},
   {id:'rice-paper',name:'Rice paper wrappers',brand:'Three Ladies',size:'340 g',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'box',keywords:'rice paper spring roll wrappers',edible:true,photo:'rice paper wrappers'},
   {id:'harissa',name:'Harissa paste',brand:'Mina',size:'280 g',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'jar',keywords:'harissa north african chili',edible:true,photo:'harissa paste'},
   {id:'soy-sauce',name:'Soy sauce',brand:'Kikkoman',size:'500 mL',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'bottle',keywords:'soy sauce',edible:true,photo:'soy sauce'},
   {id:'sriracha',name:'Sriracha sauce',brand:'Huy Fong',size:'482 g',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'bottle',keywords:'sriracha hot chili sauce',edible:true,photo:'sriracha sauce'},
   {id:'hoisin',name:'Hoisin sauce',brand:'Lee Kum Kee',size:'397 g',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'jar',keywords:'hoisin sauce asian',edible:true,photo:'hoisin sauce'},
   {id:'fish-sauce',name:'Fish sauce',brand:'Three Crabs',size:'682 mL',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'bottle',keywords:'fish sauce asian',edible:true,photo:'fish sauce'},
   {id:'curry-paste',name:'Red curry paste',brand:'Thai Kitchen',size:'113 g',departmentId:'pantry',department:'Pantry',aisleId:'world-foods',aisle:'International & Asian',shape:'jar',keywords:'curry paste thai',edible:true,photo:'red curry paste'},
  ]},
 ]},
 {id:'breakfast',name:'Breakfast',edible:true,aisles:[
  {id:'cereal-aisle',name:'Cereal',departmentId:'breakfast',items:[
   {id:'cereal',name:'Original Cheerios',brand:'General Mills',size:'350 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal cheerios oats',edible:true,photo:'original cheerios'},
   {id:'corn-flakes',name:'Corn Flakes',brand:'Kellogg’s',size:'525 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal corn flakes',edible:true,photo:'corn flakes'},
   {id:'raisin-bran',name:'Raisin Bran',brand:'Kellogg’s',size:'425 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal raisin bran',edible:true,photo:'raisin bran'},
   {id:'mini-wheats',name:'Mini-Wheats',brand:'Kellogg’s',size:'510 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal mini wheats',edible:true,photo:'mini wheats'},
   {id:'granola',name:'Vanilla almond granola',brand:'Nature’s Path',size:'325 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'bag',keywords:'granola cereal',edible:true,photo:'vanilla almond granola',alsoIn:['hot-cereal']},
   {id:'kids-cereal',name:'Froot Loops',brand:'Kellogg’s',size:'345 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal kids froot loops',edible:true,photo:'froot loops'},
   {id:'bran-flakes',name:'Bran flakes',brand:'Kellogg’s',size:'675 g',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'cereal bran flakes fibre',edible:true,photo:'bran flakes'},
   {id:'muesli',name:'Swiss muesli',brand:'Familia',size:'1 kg',departmentId:'breakfast',department:'Breakfast',aisleId:'cereal-aisle',aisle:'Cereal',shape:'box',keywords:'muesli cereal',edible:true,photo:'swiss muesli'},
  ]},
  {id:'hot-cereal',name:'Hot cereal',departmentId:'breakfast',items:[
   {id:'oats',name:'Quick oats',brand:'Quaker',size:'1 kg',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',shape:'box',keywords:'oats oatmeal quick',edible:true,photo:'quick oats'},
   {id:'steel-cut-oats',name:'Steel cut oats',brand:'Bob’s Red Mill',size:'680 g',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',shape:'bag',keywords:'oats steel cut',edible:true,photo:'steel cut oats'},
   {id:'instant-oatmeal',name:'Instant oatmeal',brand:'Quaker',size:'8 × 43 g',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',shape:'box',keywords:'oatmeal instant packets',edible:true,photo:'instant oatmeal',alsoIn:['cereal-aisle']},
   {id:'cream-of-wheat',name:'Cream of wheat',brand:'Cream of Wheat',size:'1 kg',departmentId:'breakfast',department:'Breakfast',aisleId:'hot-cereal',aisle:'Hot cereal',shape:'box',keywords:'cream of wheat porridge',edible:true,photo:'wheat porridge'},
  ]},
  {id:'breakfast-extras',name:'Syrups & breakfast',departmentId:'breakfast',items:[
   {id:'pancake-mix',name:'Pancake mix',brand:'Aunt Jemima',size:'905 g',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'box',keywords:'pancake waffle mix',edible:true,photo:'pancake mix'},
   {id:'table-syrup',name:'Table syrup',brand:'Aunt Jemima',size:'750 mL',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'bottle',keywords:'syrup pancake',edible:true,photo:'table syrup'},
   {id:'breakfast-bars',name:'Chewy granola bars',brand:'Quaker',size:'8 bars',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'box',keywords:'granola bars breakfast',edible:true,photo:'chewy granola bars'},
   {id:'toaster-pastries',name:'Toaster pastries',brand:'Pop-Tarts',size:'8 pastries',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'box',keywords:'pop tarts toaster pastries',edible:true,photo:'toaster pastries'},
   {id:'hot-chocolate',name:'Hot chocolate mix',brand:'Carnation',size:'10 sachets',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'box',keywords:'hot chocolate cocoa mix',edible:true,photo:'hot chocolate mix'},
   {id:'frozen-waffle-mix',name:'Waffle mix',brand:'Aunt Jemima',size:'905 g',departmentId:'breakfast',department:'Breakfast',aisleId:'breakfast-extras',aisle:'Syrups & breakfast',shape:'box',keywords:'waffle mix batter',edible:true,photo:'waffle mix'},
  ]},
 ]},
 {id:'snacks',name:'Snacks',edible:true,aisles:[
  {id:'chips',name:'Chips & savoury',departmentId:'snacks',items:[
   {id:'potato-chips',name:'Original potato chips',brand:'Lay’s',size:'235 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'chips potato',edible:true,photo:'original potato chips'},
   {id:'ketchup-chips',name:'Ketchup chips',brand:'Lay’s',size:'235 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'chips ketchup',edible:true,photo:'ketchup chips'},
   {id:'tortilla-chips',name:'Tortilla chips',brand:'Tostitos',size:'295 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'tortilla chips nachos',edible:true,photo:'tortilla chips'},
   {id:'cheese-puffs',name:'Cheese puffs',brand:'Cheetos',size:'310 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'cheese puffs cheetos',edible:true,photo:'cheese puffs'},
   {id:'pretzels',name:'Salted pretzels',brand:'Rold Gold',size:'350 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'pretzels',edible:true,photo:'salted pretzels'},
   {id:'popcorn',name:'Microwave popcorn',brand:'Orville',size:'3 × 82 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'box',keywords:'popcorn microwave',edible:true,photo:'microwave popcorn'},
   {id:'veggie-chips',name:'Veggie straws',brand:'Sensible Portions',size:'220 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'veggie straws chips',edible:true,photo:'veggie straws'},
   {id:'pita-chips',name:'Pita chips',brand:'Stacy’s',size:'198 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'pita chips',edible:true,photo:'pita chips'},
   {id:'popcorn-ready',name:'Ready-to-eat popcorn',brand:'SkinnyPop',size:'124 g',departmentId:'snacks',department:'Snacks',aisleId:'chips',aisle:'Chips & savoury',shape:'bag',keywords:'popcorn bagged ready',edible:true,photo:'ready to eat popcorn'},
  ]},
  {id:'crackers',name:'Crackers',departmentId:'snacks',items:[
   {id:'crackers',name:'Original crackers',brand:'Ritz',size:'200 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',shape:'box',keywords:'crackers ritz',edible:true,photo:'original crackers'},
   {id:'soda-crackers',name:'Premium Plus crackers',brand:'Christie',size:'450 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',shape:'box',keywords:'crackers soda saltine',edible:true,photo:'premium plus crackers'},
   {id:'triscuits',name:'Woven wheat crackers',brand:'Triscuit',size:'200 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',shape:'box',keywords:'crackers triscuit wheat',edible:true,photo:'woven wheat crackers'},
   {id:'rice-cakes',name:'Lightly salted rice cakes',brand:'Quaker',size:'199 g',departmentId:'snacks',department:'Snacks',aisleId:'crackers',aisle:'Crackers',shape:'bag',keywords:'rice cakes',edible:true,photo:'lightly salted rice cakes'},
  ]},
  {id:'nuts',name:'Nuts & seeds',departmentId:'snacks',items:[
   {id:'peanuts',name:'Salted peanuts',brand:'Planters',size:'600 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'jar',keywords:'peanuts nuts',edible:true,photo:'salted peanuts'},
   {id:'almonds',name:'Roasted almonds',brand:'Kirkland',size:'1.13 kg',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'almonds nuts',edible:true,photo:'roasted almonds'},
   {id:'cashews',name:'Whole cashews',brand:'Planters',size:'275 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'jar',keywords:'cashews nuts',edible:true,photo:'whole cashews'},
   {id:'mixed-nuts',name:'Mixed nuts',brand:'Planters',size:'600 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'jar',keywords:'mixed nuts',edible:true,photo:'mixed nuts'},
   {id:'sunflower-seeds',name:'Sunflower seeds',brand:'Spitz',size:'210 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'sunflower seeds',edible:true,photo:'sunflower seeds'},
   {id:'trail-mix',name:'Trail mix',brand:'Kirkland',size:'1 kg',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'trail mix nuts',edible:true,photo:'trail mix'},
   {id:'pistachios',name:'Roasted pistachios',brand:'Wonderful',size:'340 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'pistachios nuts',edible:true,photo:'roasted pistachios'},
   {id:'walnuts',name:'Walnut halves',brand:'Kirkland',size:'1 kg',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'walnuts nuts baking',edible:true,photo:'walnut halves'},
   {id:'pumpkin-seeds',name:'Pumpkin seeds',brand:'Bulk',size:'300 g',departmentId:'snacks',department:'Snacks',aisleId:'nuts',aisle:'Nuts & seeds',shape:'bag',keywords:'pumpkin seeds pepitas',edible:true,photo:'pumpkin seeds'},
  ]},
  {id:'cookies',name:'Cookies & biscuits',departmentId:'snacks',items:[
   {id:'cookies',name:'Chocolate chip cookies',brand:'Chips Ahoy!',size:'300 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',shape:'box',keywords:'cookies chocolate chip',edible:true,photo:'chocolate chip cookies'},
   {id:'oreos',name:'Sandwich cookies',brand:'Oreo',size:'303 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',shape:'box',keywords:'cookies oreo sandwich',edible:true,photo:'sandwich cookies'},
   {id:'digestives',name:'Digestive biscuits',brand:'Peek Freans',size:'400 g',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',shape:'box',keywords:'biscuits digestive',edible:true,photo:'digestive biscuits'},
   {id:'fig-bars',name:'Fruit bars',brand:'Nature Valley',size:'5 bars',departmentId:'snacks',department:'Snacks',aisleId:'cookies',aisle:'Cookies & biscuits',shape:'box',keywords:'fig bars fruit',edible:true,photo:'fruit bars'},
  ]},
  {id:'candy',name:'Chocolate & candy',departmentId:'snacks',items:[
   {id:'chocolate-bar',name:'Milk chocolate bar',brand:'Cadbury',size:'100 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'bar',keywords:'chocolate bar cadbury',edible:true,photo:'milk chocolate bar'},
   {id:'dark-chocolate',name:'Dark chocolate',brand:'Lindt',size:'100 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'bar',keywords:'chocolate dark',edible:true,photo:'dark chocolate'},
   {id:'gummy-candy',name:'Gummy bears',brand:'Haribo',size:'175 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'bag',keywords:'gummy candy bears',edible:true,photo:'gummy bears'},
   {id:'chocolate-multipack',name:'Chocolate multipack',brand:'Nestlé',size:'10 bars',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'box',keywords:'chocolate multipack',edible:true,photo:'chocolate multipack'},
   {id:'mints',name:'Peppermints',brand:'Life Savers',size:'150 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'bag',keywords:'mints candy',edible:true,photo:'peppermints'},
   {id:'licorice',name:'Licorice twists',brand:'Twizzlers',size:'375 g',departmentId:'snacks',department:'Snacks',aisleId:'candy',aisle:'Chocolate & candy',shape:'bag',keywords:'licorice candy twists',edible:true,photo:'licorice twists'},
  ]},
  {id:'dried-fruit',name:'Dried fruit & bars',departmentId:'snacks',items:[
   {id:'raisins',name:'Sultana raisins',brand:'Sun-Maid',size:'750 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'raisins dried fruit',edible:true,photo:'sultana raisins'},
   {id:'dried-cranberries',name:'Dried cranberries',brand:'Ocean Spray',size:'340 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'bag',keywords:'dried cranberries craisins',edible:true,photo:'dried cranberries'},
   {id:'dates',name:'Medjool dates',brand:'Kirkland',size:'1 kg',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'dates dried fruit',edible:true,photo:'medjool dates'},
   {id:'protein-bars',name:'Protein bars',brand:'Clif',size:'6 bars',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'protein bars energy',edible:true,photo:'protein bars'},
   {id:'fruit-snacks',name:'Fruit snacks',brand:'Welch’s',size:'10 pouches',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'fruit snacks gummies kids',edible:true,photo:'fruit snacks'},
   {id:'jerky',name:'Beef jerky',brand:'Jack Link’s',size:'80 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'pouch',keywords:'jerky beef snack',edible:true,photo:'beef jerky'},
   {id:'applesauce-cups',name:'Applesauce cups',brand:'Mott’s',size:'6 × 111 mL',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'applesauce cups snack',edible:true,photo:'applesauce cups',alsoIn:['fruit']},
   {id:'seaweed-snacks',name:'Roasted seaweed snacks',brand:'Kim Nori',size:'4 × 5 g',departmentId:'snacks',department:'Snacks',aisleId:'dried-fruit',aisle:'Dried fruit & bars',shape:'box',keywords:'seaweed snacks nori',edible:true,photo:'roasted seaweed snacks'},
  ]},
 ]},
 {id:'frozen',name:'Frozen',edible:true,aisles:[
  {id:'frozen-veg',name:'Frozen vegetables',departmentId:'frozen',items:[
   {id:'peas',name:'Frozen green peas',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen peas',edible:true,photo:'frozen peas'},
   {id:'frozen-corn',name:'Frozen corn',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen corn',edible:true,photo:'frozen corn'},
   {id:'frozen-broccoli',name:'Frozen broccoli florets',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen broccoli',edible:true,photo:'frozen broccoli florets'},
   {id:'frozen-mixed-veg',name:'Mixed vegetables',brand:'Green Giant',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen mixed vegetables',edible:true,photo:'mixed vegetables'},
   {id:'frozen-spinach',name:'Frozen chopped spinach',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen spinach',edible:true,photo:'frozen chopped spinach'},
   {id:'frozen-edamame',name:'Frozen edamame',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen edamame soybeans',edible:true,photo:'frozen edamame'},
   {id:'frozen-cauliflower',name:'Frozen cauliflower',brand:'Europe’s Best',size:'500 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen cauliflower',edible:true,photo:'frozen cauliflower'},
   {id:'frozen-stirfry',name:'Stir-fry vegetable blend',brand:'Europe’s Best',size:'750 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-veg',aisle:'Frozen vegetables',shape:'bag',keywords:'frozen stir fry vegetables',edible:true,photo:'stir fry vegetable blend'},
  ]},
  {id:'frozen-fruit',name:'Frozen fruit',departmentId:'frozen',items:[
   {id:'frozen-berries',name:'Frozen mixed berries',brand:'Compliments',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',shape:'bag',keywords:'frozen berries mixed',edible:true,photo:'frozen mixed berries'},
   {id:'frozen-blueberries',name:'Frozen blueberries',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',shape:'bag',keywords:'frozen blueberries',edible:true,photo:'frozen blueberries'},
   {id:'frozen-strawberries',name:'Frozen strawberries',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',shape:'bag',keywords:'frozen strawberries',edible:true,photo:'frozen strawberries'},
   {id:'frozen-mango',name:'Frozen mango chunks',brand:'Europe’s Best',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-fruit',aisle:'Frozen fruit',shape:'bag',keywords:'frozen mango',edible:true,photo:'frozen mango chunks'},
  ]},
  {id:'frozen-meals',name:'Frozen meals & pizza',departmentId:'frozen',items:[
   {id:'frozen-pizza',name:'Pepperoni pizza',brand:'Delissio',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'pizza',keywords:'frozen pizza pepperoni',edible:true,photo:'pepperoni pizza'},
   {id:'frozen-lasagna',name:'Frozen lasagna',brand:'Stouffer’s',size:'1.1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'tray',keywords:'frozen lasagna meal',edible:true,photo:'frozen lasagna'},
   {id:'frozen-dinner',name:'Chicken dinner',brand:'Swanson',size:'300 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'tray',keywords:'frozen dinner tv meal',edible:true,photo:'chicken dinner'},
   {id:'perogies',name:'Potato perogies',brand:'Cheemo',size:'907 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'box',keywords:'perogies pierogies frozen',edible:true,photo:'potato perogies'},
   {id:'spring-rolls',name:'Vegetable spring rolls',brand:'President’s Choice',size:'624 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'box',keywords:'spring rolls frozen appetizer',edible:true,photo:'vegetable spring rolls'},
   {id:'dumplings',name:'Frozen dumplings',brand:'Bibigo',size:'600 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'box',keywords:'dumplings potstickers frozen',edible:true,photo:'frozen dumplings'},
   {id:'garlic-bread',name:'Frozen garlic bread',brand:'Pillsbury',size:'320 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'box',keywords:'garlic bread frozen',edible:true,photo:'frozen garlic bread'},
   {id:'frozen-pie',name:'Frozen apple pie',brand:'Sara Lee',size:'1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'tray',keywords:'frozen pie dessert apple',edible:true,photo:'frozen apple pie'},
   {id:'burritos',name:'Frozen burritos',brand:'El Monterey',size:'8 burritos',departmentId:'frozen',department:'Frozen',aisleId:'frozen-meals',aisle:'Frozen meals & pizza',shape:'box',keywords:'burritos frozen mexican',edible:true,photo:'frozen burritos'},
  ]},
  {id:'frozen-potato',name:'Frozen potatoes',departmentId:'frozen',items:[
   {id:'french-fries',name:'Straight cut fries',brand:'McCain',size:'1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',shape:'bag',keywords:'fries frozen french',edible:true,photo:'straight cut fries'},
   {id:'hash-browns',name:'Hash brown patties',brand:'McCain',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',shape:'box',keywords:'hash browns frozen',edible:true,photo:'hash brown patties'},
   {id:'tater-tots',name:'Potato tots',brand:'McCain',size:'1 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-potato',aisle:'Frozen potatoes',shape:'bag',keywords:'tater tots frozen',edible:true,photo:'potato tots'},
  ]},
  {id:'frozen-seafood',name:'Frozen seafood & meat',departmentId:'frozen',items:[
   {id:'fish-sticks',name:'Breaded fish sticks',brand:'High Liner',size:'700 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',shape:'box',keywords:'fish sticks frozen breaded',edible:true,photo:'breaded fish sticks',alsoIn:['seafood']},
   {id:'frozen-shrimp',name:'Cooked shrimp ring',brand:'Frozen',size:'454 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',shape:'shrimp',keywords:'shrimp ring frozen',edible:true,photo:'cooked shrimp ring',alsoIn:['seafood']},
   {id:'chicken-nuggets',name:'Chicken nuggets',brand:'Janes',size:'800 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',shape:'box',keywords:'chicken nuggets frozen',edible:true,photo:'chicken nuggets',alsoIn:['poultry']},
   {id:'frozen-burgers',name:'Beef burger patties',brand:'Frozen',size:'1.13 kg',departmentId:'frozen',department:'Frozen',aisleId:'frozen-seafood',aisle:'Frozen seafood & meat',shape:'box',keywords:'burgers patties frozen',edible:true,photo:'beef burger patties'},
  ]},
  {id:'ice-cream',name:'Ice cream & desserts',departmentId:'frozen',items:[
   {id:'ice-cream',name:'Vanilla ice cream',brand:'Chapman’s',size:'2 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'tub',keywords:'ice cream vanilla',edible:true,photo:'vanilla ice cream'},
   {id:'chocolate-ice-cream',name:'Chocolate ice cream',brand:'Chapman’s',size:'2 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'tub',keywords:'ice cream chocolate',edible:true,photo:'chocolate ice cream'},
   {id:'ice-cream-bars',name:'Ice cream bars',brand:'Häagen-Dazs',size:'3 bars',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'box',keywords:'ice cream bars',edible:true,photo:'ice cream bars'},
   {id:'frozen-yogurt',name:'Frozen yogurt',brand:'Yasso',size:'500 mL',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'tub',keywords:'frozen yogurt',edible:true,photo:'frozen yogurt'},
   {id:'popsicles',name:'Freezer pops',brand:'Chapman’s',size:'24 pops',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'box',keywords:'popsicles freezies',edible:true,photo:'freezer pops'},
   {id:'whipped-topping',name:'Whipped topping',brand:'Cool Whip',size:'1 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'tub',keywords:'whipped topping cool whip',edible:true,photo:'whipped topping'},
   {id:'sorbet',name:'Mango sorbet',brand:'Chapman’s',size:'1 L',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'tub',keywords:'sorbet frozen dessert',edible:true,photo:'mango sorbet'},
   {id:'ice-cream-sandwiches',name:'Ice cream sandwiches',brand:'Chapman’s',size:'8 sandwiches',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'box',keywords:'ice cream sandwiches',edible:true,photo:'ice cream sandwiches'},
   {id:'ice-cubes',name:'Bagged ice',brand:'Arctic Glacier',size:'5 kg',departmentId:'frozen',department:'Frozen',aisleId:'ice-cream',aisle:'Ice cream & desserts',shape:'bag',keywords:'ice bagged cubes',edible:true,photo:'bagged ice',alsoIn:['frozen-meals']},
  ]},
  {id:'frozen-breakfast',name:'Frozen breakfast',departmentId:'frozen',items:[
   {id:'waffles',name:'Frozen waffles',brand:'Eggo',size:'280 g',departmentId:'frozen',department:'Frozen',aisleId:'frozen-breakfast',aisle:'Frozen breakfast',shape:'box',keywords:'waffles frozen eggo',edible:true,photo:'frozen waffles'},
   {id:'breakfast-sandwiches',name:'Breakfast sandwiches',brand:'Jimmy Dean',size:'4 sandwiches',departmentId:'frozen',department:'Frozen',aisleId:'frozen-breakfast',aisle:'Frozen breakfast',shape:'box',keywords:'breakfast sandwich frozen',edible:true,photo:'breakfast sandwiches'},
  ]},
 ]},
 {id:'beverages',name:'Beverages',edible:true,aisles:[
  {id:'water',name:'Water',departmentId:'beverages',items:[
   {id:'bottled-water',name:'Spring water',brand:'Nestlé Pure Life',size:'24 × 500 mL',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',shape:'bottle',keywords:'water bottled spring',edible:true,photo:'spring water'},
   {id:'sparkling-water',name:'Sparkling water',brand:'Bubly',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',shape:'can',keywords:'sparkling water soda club',edible:true,photo:'sparkling water'},
   {id:'jug-water',name:'Distilled water',brand:'No Name',size:'4 L',departmentId:'beverages',department:'Beverages',aisleId:'water',aisle:'Water',shape:'jug',keywords:'water distilled jug',edible:true,photo:'distilled water'},
  ]},
  {id:'juice',name:'Juice',departmentId:'beverages',items:[
   {id:'orange-juice',name:'Orange juice',brand:'Tropicana',size:'1.75 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'carton',keywords:'orange juice oj',edible:true,photo:'orange juice'},
   {id:'apple-juice',name:'Apple juice',brand:'Allen’s',size:'1.36 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'bottle',keywords:'apple juice',edible:true,photo:'apple juice'},
   {id:'cranberry-juice',name:'Cranberry cocktail',brand:'Ocean Spray',size:'1.89 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'bottle',keywords:'cranberry juice',edible:true,photo:'cranberry cocktail'},
   {id:'grape-juice',name:'Grape juice',brand:'Welch’s',size:'1.36 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'bottle',keywords:'grape juice',edible:true,photo:'grape juice'},
   {id:'juice-boxes',name:'Apple juice boxes',brand:'Oasis',size:'8 × 200 mL',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'box',keywords:'juice boxes kids',edible:true,photo:'apple juice boxes'},
   {id:'lemonade',name:'Lemonade',brand:'Simply',size:'1.54 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'carton',keywords:'lemonade',edible:true,photo:'lemonade'},
   {id:'coconut-water',name:'Coconut water',brand:'Vita Coco',size:'1 L',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'carton',keywords:'coconut water',edible:true,photo:'coconut water'},
   {id:'iced-tea',name:'Iced tea',brand:'Nestea',size:'12 × 341 mL',departmentId:'beverages',department:'Beverages',aisleId:'juice',aisle:'Juice',shape:'can',keywords:'iced tea pop',edible:true,photo:'iced tea'},
  ]},
  {id:'soft-drinks',name:'Soft drinks',departmentId:'beverages',items:[
   {id:'cola',name:'Cola',brand:'Coca-Cola',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'can',keywords:'cola coke pop soda',edible:true,photo:'cola'},
   {id:'diet-cola',name:'Diet cola',brand:'Coca-Cola',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'can',keywords:'diet cola coke pop',edible:true,photo:'diet cola'},
   {id:'ginger-ale',name:'Ginger ale',brand:'Canada Dry',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'can',keywords:'ginger ale pop soda',edible:true,photo:'ginger ale'},
   {id:'root-beer',name:'Root beer',brand:'A&W',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'can',keywords:'root beer pop soda',edible:true,photo:'root beer'},
   {id:'lemon-lime',name:'Lemon lime soda',brand:'Sprite',size:'12 × 355 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'can',keywords:'sprite pop soda lemon lime',edible:true,photo:'lemon lime soda'},
   {id:'tonic-water',name:'Tonic water',brand:'Canada Dry',size:'1 L',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'bottle',keywords:'tonic water mixer',edible:true,photo:'tonic water'},
   {id:'kombucha',name:'Kombucha',brand:'GT’s',size:'480 mL',departmentId:'beverages',department:'Beverages',aisleId:'soft-drinks',aisle:'Soft drinks',shape:'bottle',keywords:'kombucha fermented',edible:true,photo:'kombucha'},
  ]},
  {id:'coffee-aisle',name:'Coffee',departmentId:'beverages',items:[
   {id:'coffee',name:'Medium roast coffee',brand:'Tim Hortons',size:'300 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'coffeebag',keywords:'coffee ground medium',edible:true,photo:'medium roast coffee'},
   {id:'coffee-store',name:'Medium roast coffee',brand:'Store brand',size:'300 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'coffeebag',keywords:'coffee ground store',edible:true,photo:'medium roast coffee'},
   {id:'dark-roast',name:'Dark roast coffee',brand:'Starbucks',size:'340 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'coffeebag',keywords:'coffee dark roast',edible:true,photo:'dark roast coffee'},
   {id:'coffee-pods',name:'Coffee pods',brand:'Keurig',size:'30 pods',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'box',keywords:'coffee pods k cups',edible:true,photo:'coffee pods'},
   {id:'instant-coffee',name:'Instant coffee',brand:'Nescafé',size:'200 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'jar',keywords:'instant coffee',edible:true,photo:'instant coffee'},
   {id:'whole-bean',name:'Whole bean coffee',brand:'Kicking Horse',size:'454 g',departmentId:'beverages',department:'Beverages',aisleId:'coffee-aisle',aisle:'Coffee',shape:'coffeebag',keywords:'coffee whole bean',edible:true,photo:'whole bean coffee'},
  ]},
  {id:'tea-aisle',name:'Tea',departmentId:'beverages',items:[
   {id:'black-tea',name:'Orange pekoe tea',brand:'Red Rose',size:'72 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',shape:'teabox',keywords:'tea black orange pekoe',edible:true,photo:'orange pekoe tea'},
   {id:'green-tea',name:'Green tea',brand:'Tetley',size:'48 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',shape:'teabox',keywords:'tea green',edible:true,photo:'green tea'},
   {id:'herbal-tea',name:'Chamomile tea',brand:'Celestial',size:'20 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',shape:'teabox',keywords:'tea herbal chamomile',edible:true,photo:'chamomile tea'},
   {id:'chai',name:'Chai tea',brand:'Tetley',size:'20 bags',departmentId:'beverages',department:'Beverages',aisleId:'tea-aisle',aisle:'Tea',shape:'teabox',keywords:'tea chai spiced',edible:true,photo:'chai tea'},
  ]},
  {id:'energy',name:'Sports & energy',departmentId:'beverages',items:[
   {id:'sports-drink',name:'Sports drink',brand:'Gatorade',size:'6 × 591 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',shape:'bottle',keywords:'gatorade sports drink',edible:true,photo:'sports drink'},
   {id:'energy-drink',name:'Energy drink',brand:'Red Bull',size:'4 × 250 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',shape:'can',keywords:'energy drink red bull',edible:true,photo:'energy drink'},
   {id:'protein-shake',name:'Protein shake',brand:'Premier Protein',size:'4 × 325 mL',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',shape:'carton',keywords:'protein shake drink',edible:true,photo:'shake'},
   {id:'drink-crystals',name:'Drink crystals',brand:'Crystal Light',size:'10 sachets',departmentId:'beverages',department:'Beverages',aisleId:'energy',aisle:'Sports & energy',shape:'box',keywords:'drink crystals powder mix',edible:true,photo:'drink crystals'},
  ]},
 ]},
 {id:'household',name:'Household',edible:false,aisles:[
  {id:'paper',name:'Paper products',departmentId:'household',items:[
   {id:'toilet-paper',name:'Bathroom tissue',brand:'Cashmere',size:'12 rolls',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',shape:'roll',keywords:'toilet paper bathroom tissue',edible:false,photo:'bathroom tissue'},
   {id:'paper-towel',name:'Paper towels',brand:'Bounty',size:'6 rolls',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',shape:'roll',keywords:'paper towel kitchen',edible:false,photo:'paper towels'},
   {id:'facial-tissue',name:'Facial tissue',brand:'Kleenex',size:'6 boxes',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',shape:'box',keywords:'kleenex tissue facial',edible:false,photo:'facial tissue'},
   {id:'napkins',name:'Paper napkins',brand:'Royale',size:'200 napkins',departmentId:'household',department:'Household',aisleId:'paper',aisle:'Paper products',shape:'box',keywords:'napkins serviettes',edible:false,photo:'paper napkins'},
  ]},
  {id:'cleaning',name:'Cleaning',departmentId:'household',items:[
   {id:'all-purpose-cleaner',name:'All purpose cleaner',brand:'Mr. Clean',size:'1.4 L',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'spray',keywords:'cleaner all purpose spray',edible:false,photo:'all purpose cleaner'},
   {id:'glass-cleaner',name:'Glass cleaner',brand:'Windex',size:'950 mL',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'spray',keywords:'glass cleaner windex window',edible:false,photo:'glass cleaner'},
   {id:'bleach',name:'Liquid bleach',brand:'Javex',size:'1.78 L',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'jug',keywords:'bleach javex',edible:false,photo:'liquid bleach'},
   {id:'disinfecting-wipes',name:'Disinfecting wipes',brand:'Lysol',size:'80 wipes',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'can',keywords:'wipes disinfecting lysol',edible:false,photo:'disinfecting wipes'},
   {id:'toilet-cleaner',name:'Toilet bowl cleaner',brand:'Lysol',size:'710 mL',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'bottle',keywords:'toilet cleaner bowl',edible:false,photo:'toilet bowl cleaner'},
   {id:'garbage-bags',name:'Kitchen garbage bags',brand:'Glad',size:'40 bags',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'box',keywords:'garbage bags trash',edible:false,photo:'kitchen garbage bags'},
   {id:'air-freshener',name:'Air freshener spray',brand:'Febreze',size:'300 g',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'spray',keywords:'air freshener spray',edible:false,photo:'air freshener spray'},
   {id:'oven-cleaner',name:'Oven cleaner',brand:'Easy-Off',size:'400 g',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'spray',keywords:'oven cleaner',edible:false,photo:'oven cleaner'},
   {id:'drain-cleaner',name:'Drain cleaner',brand:'Drano',size:'900 mL',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'jug',keywords:'drain cleaner unclog',edible:false,photo:'drain cleaner'},
   {id:'rubber-gloves',name:'Cleaning gloves',brand:'Playtex',size:'1 pair',departmentId:'household',department:'Household',aisleId:'cleaning',aisle:'Cleaning',shape:'pouch',keywords:'rubber gloves cleaning',edible:false,photo:'cleaning gloves'},
  ]},
  {id:'laundry',name:'Laundry',departmentId:'household',items:[
   {id:'laundry-detergent',name:'Liquid laundry detergent',brand:'Tide',size:'2.72 L',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',shape:'jug',keywords:'laundry detergent tide',edible:false,photo:'liquid laundry detergent'},
   {id:'laundry-pods',name:'Laundry pods',brand:'Tide',size:'42 pods',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',shape:'tub',keywords:'laundry pods detergent',edible:false,photo:'laundry pods'},
   {id:'fabric-softener',name:'Fabric softener',brand:'Downy',size:'2.03 L',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',shape:'jug',keywords:'fabric softener downy',edible:false,photo:'fabric softener'},
   {id:'dryer-sheets',name:'Dryer sheets',brand:'Bounce',size:'160 sheets',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',shape:'box',keywords:'dryer sheets bounce',edible:false,photo:'dryer sheets'},
   {id:'stain-remover',name:'Stain remover spray',brand:'Shout',size:'650 mL',departmentId:'household',department:'Household',aisleId:'laundry',aisle:'Laundry',shape:'spray',keywords:'stain remover',edible:false,photo:'stain remover spray'},
  ]},
  {id:'dish',name:'Dish',departmentId:'household',items:[
   {id:'dish-soap',name:'Dish soap',brand:'Palmolive',size:'740 mL',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',shape:'bottle',keywords:'dish soap washing up',edible:false,photo:'dish soap'},
   {id:'dishwasher-pods',name:'Dishwasher pods',brand:'Cascade',size:'45 pods',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',shape:'tub',keywords:'dishwasher pods cascade',edible:false,photo:'dishwasher pods'},
   {id:'sponges',name:'Scrub sponges',brand:'Scotch-Brite',size:'6 sponges',departmentId:'household',department:'Household',aisleId:'dish',aisle:'Dish',shape:'bag',keywords:'sponges scrub dish',edible:false,photo:'scrub sponges'},
  ]},
  {id:'storage',name:'Food storage & foil',departmentId:'household',items:[
   {id:'aluminum-foil',name:'Aluminum foil',brand:'Alcan',size:'30 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'foil aluminum tin',edible:false,photo:'aluminum foil'},
   {id:'plastic-wrap',name:'Plastic wrap',brand:'Glad',size:'60 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'plastic wrap cling film',edible:false,photo:'plastic wrap'},
   {id:'parchment-paper',name:'Parchment paper',brand:'PC',size:'20 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'parchment paper baking',edible:false,photo:'parchment paper'},
   {id:'sandwich-bags',name:'Sandwich bags',brand:'Ziploc',size:'100 bags',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'ziploc sandwich bags',edible:false,photo:'sandwich bags'},
   {id:'freezer-bags',name:'Freezer bags',brand:'Ziploc',size:'40 bags',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'ziploc freezer bags',edible:false,photo:'freezer bags'},
   {id:'wax-paper',name:'Wax paper',brand:'Cut-Rite',size:'23 m',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'box',keywords:'wax paper',edible:false,photo:'wax paper'},
   {id:'food-containers',name:'Food containers',brand:'Ziploc',size:'5 containers',departmentId:'household',department:'Household',aisleId:'storage',aisle:'Food storage & foil',shape:'tub',keywords:'containers food storage tupperware',edible:false,photo:'food containers'},
  ]},
  {id:'home-hardware',name:'Home essentials',departmentId:'household',items:[
   {id:'light-bulbs',name:'LED light bulbs',brand:'Philips',size:'4 bulbs',departmentId:'household',department:'Household',aisleId:'home-hardware',aisle:'Home essentials',shape:'box',keywords:'light bulbs led',edible:false,photo:'led light bulbs'},
   {id:'batteries-aa',name:'AA batteries',brand:'Duracell',size:'8 batteries',departmentId:'household',department:'Household',aisleId:'home-hardware',aisle:'Home essentials',shape:'box',keywords:'batteries aa',edible:false,photo:'aa batteries'},
   {id:'batteries-aaa',name:'AAA batteries',brand:'Duracell',size:'8 batteries',departmentId:'household',department:'Household',aisleId:'home-hardware',aisle:'Home essentials',shape:'box',keywords:'batteries aaa',edible:false,photo:'aaa batteries'},
   {id:'matches',name:'Wooden matches',brand:'Redbird',size:'250 matches',departmentId:'household',department:'Household',aisleId:'home-hardware',aisle:'Home essentials',shape:'box',keywords:'matches',edible:false,photo:'wooden matches'},
   {id:'candles',name:'Tea light candles',brand:'Bolsius',size:'50 candles',departmentId:'household',department:'Household',aisleId:'home-hardware',aisle:'Home essentials',shape:'box',keywords:'candles tea lights',edible:false,photo:'tea light candles'},
  ]},
 ]},
 {id:'personal',name:'Personal care',edible:false,aisles:[
  {id:'hair',name:'Hair care',departmentId:'personal',items:[
   {id:'shampoo',name:'Daily shampoo',brand:'Head & Shoulders',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',shape:'bottle',keywords:'shampoo hair',edible:false,photo:'daily shampoo'},
   {id:'conditioner',name:'Daily conditioner',brand:'Head & Shoulders',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',shape:'bottle',keywords:'conditioner hair',edible:false,photo:'daily conditioner'},
   {id:'hair-spray',name:'Hair spray',brand:'TRESemmé',size:'311 g',departmentId:'personal',department:'Personal care',aisleId:'hair',aisle:'Hair care',shape:'spray',keywords:'hair spray styling',edible:false,photo:'hair spray'},
  ]},
  {id:'oral',name:'Oral care',departmentId:'personal',items:[
   {id:'toothpaste',name:'Cavity protection toothpaste',brand:'Crest',size:'2 × 130 mL',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',shape:'tube',keywords:'toothpaste crest',edible:false,photo:'cavity protection toothpaste'},
   {id:'toothbrush',name:'Soft toothbrushes',brand:'Oral-B',size:'2 brushes',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',shape:'toothbrush',keywords:'toothbrush',edible:false,photo:'soft toothbrushes'},
   {id:'mouthwash',name:'Antiseptic mouthwash',brand:'Listerine',size:'1 L',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',shape:'bottle',keywords:'mouthwash listerine',edible:false,photo:'antiseptic mouthwash'},
   {id:'floss',name:'Dental floss',brand:'Oral-B',size:'50 m',departmentId:'personal',department:'Personal care',aisleId:'oral',aisle:'Oral care',shape:'box',keywords:'floss dental',edible:false,photo:'dental floss'},
  ]},
  {id:'body',name:'Body & soap',departmentId:'personal',items:[
   {id:'body-wash',name:'Moisturizing body wash',brand:'Dove',size:'750 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',shape:'bottle',keywords:'body wash shower gel',edible:false,photo:'moisturizing body wash'},
   {id:'bar-soap',name:'Beauty bar soap',brand:'Dove',size:'6 bars',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',shape:'soapbar',keywords:'soap bar',edible:false,photo:'beauty bar soap'},
   {id:'hand-soap',name:'Hand soap',brand:'Softsoap',size:'332 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',shape:'bottle',keywords:'hand soap',edible:false,photo:'hand soap'},
   {id:'lotion',name:'Body lotion',brand:'Nivea',size:'400 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',shape:'bottle',keywords:'lotion moisturizer body',edible:false,photo:'body lotion'},
   {id:'sunscreen',name:'Sunscreen SPF 50',brand:'Banana Boat',size:'240 mL',departmentId:'personal',department:'Personal care',aisleId:'body',aisle:'Body & soap',shape:'bottle',keywords:'sunscreen spf sun',edible:false,photo:'sunscreen spf'},
  ]},
  {id:'deodorant',name:'Deodorant & shaving',departmentId:'personal',items:[
   {id:'deodorant-stick',name:'Antiperspirant',brand:'Degree',size:'76 g',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',shape:'tube',keywords:'deodorant antiperspirant',edible:false,photo:'antiperspirant'},
   {id:'razors',name:'Disposable razors',brand:'Gillette',size:'5 razors',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',shape:'box',keywords:'razors shaving disposable',edible:false,photo:'disposable razors'},
   {id:'shaving-cream',name:'Shaving gel',brand:'Gillette',size:'198 g',departmentId:'personal',department:'Personal care',aisleId:'deodorant',aisle:'Deodorant & shaving',shape:'spray',keywords:'shaving cream gel',edible:false,photo:'shaving gel'},
  ]},
  {id:'health',name:'Health & first aid',departmentId:'personal',items:[
   {id:'pain-relief',name:'Extra strength tablets',brand:'Tylenol',size:'100 caplets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'box',keywords:'tylenol pain relief acetaminophen',edible:false,photo:'extra strength tablets'},
   {id:'ibuprofen',name:'Ibuprofen tablets',brand:'Advil',size:'72 caplets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'box',keywords:'advil ibuprofen pain',edible:false,photo:'ibuprofen tablets'},
   {id:'bandages',name:'Assorted bandages',brand:'Band-Aid',size:'60 bandages',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'box',keywords:'bandages band aid first aid',edible:false,photo:'assorted bandages'},
   {id:'vitamins',name:'Multivitamin',brand:'Centrum',size:'90 tablets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'jar',keywords:'vitamins multivitamin',edible:false,photo:'multivitamin'},
   {id:'hand-sanitizer',name:'Hand sanitizer',brand:'Purell',size:'354 mL',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'bottle',keywords:'hand sanitizer',edible:false,photo:'hand sanitizer',alsoIn:['cleaning']},
   {id:'cough-syrup',name:'Cough syrup',brand:'Buckley’s',size:'200 mL',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'bottle',keywords:'cough syrup cold',edible:false,photo:'cough syrup'},
   {id:'allergy-tablets',name:'Allergy tablets',brand:'Reactine',size:'30 tablets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'box',keywords:'allergy antihistamine',edible:false,photo:'allergy tablets'},
   {id:'antacid',name:'Antacid tablets',brand:'Tums',size:'100 tablets',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'jar',keywords:'antacid heartburn tums',edible:false,photo:'antacid tablets'},
   {id:'cotton-swabs',name:'Cotton swabs',brand:'Q-tips',size:'400 swabs',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'box',keywords:'cotton swabs q tips',edible:false,photo:'cotton swabs'},
   {id:'thermometer',name:'Digital thermometer',brand:'Life Brand',size:'Each',departmentId:'personal',department:'Personal care',aisleId:'health',aisle:'Health & first aid',shape:'tube',keywords:'thermometer fever',edible:false,photo:'digital thermometer'},
  ]},
 ]},
 {id:'baby',name:'Baby & child',edible:false,aisles:[
  {id:'diapers',name:'Diapers & wipes',departmentId:'baby',items:[
   {id:'diapers',name:'Baby dry diapers',brand:'Pampers',size:'Size 4, 92 count',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',shape:'diaper',keywords:'diapers pampers',edible:false,photo:'baby dry diapers'},
   {id:'baby-wipes',name:'Sensitive baby wipes',brand:'Pampers',size:'576 wipes',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',shape:'box',keywords:'baby wipes',edible:false,photo:'sensitive baby wipes',alsoIn:['cleaning']},
   {id:'training-pants',name:'Training pants',brand:'Pull-Ups',size:'74 count',departmentId:'baby',department:'Baby & child',aisleId:'diapers',aisle:'Diapers & wipes',shape:'diaper',keywords:'pull ups training pants',edible:false,photo:'training pants'},
  ]},
  {id:'baby-food',name:'Baby food & formula',departmentId:'baby',items:[
   {id:'baby-cereal',name:'Infant rice cereal',brand:'Gerber',size:'227 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',shape:'box',keywords:'baby cereal infant',edible:false,photo:'infant rice cereal'},
   {id:'baby-puree',name:'Fruit puree pouches',brand:'Gerber',size:'4 × 128 mL',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',shape:'pouch',keywords:'baby food puree pouch',edible:false,photo:'fruit puree pouches'},
   {id:'infant-formula',name:'Infant formula',brand:'Similac',size:'658 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',shape:'can',keywords:'formula infant baby',edible:false,photo:'infant formula'},
   {id:'toddler-snacks',name:'Puffs snack',brand:'Gerber',size:'42 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-food',aisle:'Baby food & formula',shape:'jar',keywords:'baby puffs toddler snack',edible:false,photo:'puffs snack'},
  ]},
  {id:'baby-care',name:'Baby care',departmentId:'baby',items:[
   {id:'baby-shampoo',name:'Baby shampoo',brand:'Johnson’s',size:'800 mL',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',shape:'bottle',keywords:'baby shampoo',edible:false,photo:'baby shampoo'},
   {id:'diaper-cream',name:'Diaper rash cream',brand:'Penaten',size:'100 g',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',shape:'tube',keywords:'diaper cream rash',edible:false,photo:'diaper rash cream'},
   {id:'baby-bottles',name:'Baby bottles',brand:'Avent',size:'3 bottles',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',shape:'bottle',keywords:'baby bottles feeding',edible:false,photo:'baby bottles'},
   {id:'soothers',name:'Soothers',brand:'Avent',size:'2 soothers',departmentId:'baby',department:'Baby & child',aisleId:'baby-care',aisle:'Baby care',shape:'pouch',keywords:'soother pacifier dummy',edible:false,photo:'soothers'},
  ]},
 ]},
 {id:'pet',name:'Pet',edible:false,aisles:[
  {id:'dog',name:'Dog',departmentId:'pet',items:[
   {id:'dog-food-dry',name:'Dry dog food',brand:'Pedigree',size:'8 kg',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',shape:'bag',keywords:'dog food dry kibble',edible:false,photo:'dry dog food'},
   {id:'dog-food-wet',name:'Wet dog food',brand:'Pedigree',size:'12 × 300 g',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',shape:'can',keywords:'dog food wet canned',edible:false,photo:'wet dog food'},
   {id:'dog-treats',name:'Dog biscuits',brand:'Milk-Bone',size:'1.8 kg',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',shape:'box',keywords:'dog treats biscuits',edible:false,photo:'dog biscuits'},
   {id:'poop-bags',name:'Waste bags',brand:'Bags on Board',size:'120 bags',departmentId:'pet',department:'Pet',aisleId:'dog',aisle:'Dog',shape:'box',keywords:'dog poop waste bags',edible:false,photo:'waste bags'},
  ]},
  {id:'cat',name:'Cat',departmentId:'pet',items:[
   {id:'cat-food-dry',name:'Dry cat food',brand:'Whiskas',size:'3 kg',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',shape:'bag',keywords:'cat food dry kibble',edible:false,photo:'dry cat food'},
   {id:'cat-food-wet',name:'Wet cat food',brand:'Whiskas',size:'12 × 85 g',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',shape:'pouch',keywords:'cat food wet pouches',edible:false,photo:'wet cat food'},
   {id:'cat-litter',name:'Clumping cat litter',brand:'Tidy Cats',size:'16 kg',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',shape:'jug',keywords:'cat litter',edible:false,photo:'clumping cat litter'},
   {id:'cat-treats',name:'Cat treats',brand:'Temptations',size:'180 g',departmentId:'pet',department:'Pet',aisleId:'cat',aisle:'Cat',shape:'pouch',keywords:'cat treats',edible:false,photo:'cat treats'},
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

/** Items shown in an aisle, including any cross-listed from elsewhere. */
export function itemsInAisle(aisleId:string):CatalogueItem[]{
 const own=aisleById(aisleId)?.items??[];
 const borrowed=ALL_ITEMS.filter(i=>i.aisleId!==aisleId&&i.alsoIn?.includes(aisleId));
 return [...own,...borrowed];
}

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

