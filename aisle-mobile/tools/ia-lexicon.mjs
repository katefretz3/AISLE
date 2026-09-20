// A small lexicon of grocery language.
//
// It maps words to CONCEPTS ("berry" → fruit, "frozen" → a frozen state), never
// to departments or aisles. That distinction is what keeps the IA study honest:
// the lexicon models what a shopper knows about the English word, and the tree
// under test is what has to turn that knowledge into a location. If this file
// named departments, the study would just be marking its own homework.
//
// Two kinds of concept:
//   substance — what the thing fundamentally is
//   state     — how it has been processed or is stored
export const SUBSTANCE={
 fruit:/\b(fruit|apple|banana|berry|berries|blueberr\w*|strawberr\w*|raspberr\w*|blackberr\w*|cranberr\w*|cherry|cherries|grape|orange|clementine|mandarin|lemon|lime|grapefruit|citrus|pear|peach|nectarine|plum|apricot|mango|pineapple|kiwi|melon|watermelon|cantaloupe|papaya|pomegranate|fig|date|raisin|avocado|plantain|olive)\b/,
 vegetable:/\b(vegetable|veggie|tomato|potato|onion|shallot|garlic|carrot|celery|lettuce|romaine|spinach|kale|cabbage|bok|cucumber|zucchini|courgette|pepper|capsicum|chili|chilli|jalapeno|mushroom|cremini|broccoli|cauliflower|asparagus|sprout|eggplant|aubergine|squash|beet|turnip|parsnip|radish|leek|fennel|artichoke|corn|pea|bean|greens|salad|slaw|coleslaw|ginger)\b/,
 herb:/\b(herb|basil|cilantro|coriander|parsley|mint|rosemary|thyme|dill|oregano|bay)\b/,
 meat:/\b(meat|beef|steak|ribeye|striploin|pork|chop|tenderloin|lamb|veal|bacon|sausage|wiener|ham|salami|pepperoni|jerky|mince|ground|liver|rib)\b/,
 poultry:/\b(chicken|turkey|poultry|drumstick|wing|nugget|rotisserie)\b/,
 fish:/\b(fish|salmon|tuna|cod|haddock|tilapia|sardine|anchovy|anchovies|lox)\b/,
 shellfish:/\b(shrimp|prawn|mussel|scallop|crab|lobster|clam|shellfish)\b/,
 dairy:/\b(milk|dairy|cream|yogurt|yoghurt|skyr|kefir|butter|margarine|buttermilk)\b/,
 cheese:/\b(cheese|cheddar|mozzarella|parmesan|feta|brie|havarti|ricotta|swiss|goat|cottage)\b/,
 egg:/\b(egg|eggs)\b/,
 bread:/\b(bread|loaf|bun|roll|bagel|tortilla|wrap|pita|naan|baguette|focaccia|sourdough|muffin|croissant|crust)\b/,
 pasta:/\b(pasta|spaghetti|penne|fusilli|macaroni|lasagna|noodle|ramen|gnocchi|tortellini|couscous)\b/,
 grain:/\b(rice|grain|quinoa|barley|oat|oatmeal|flour|cornmeal|polenta|bran|wheat|cereal|granola|muesli)\b/,
 legume:/\b(bean|lentil|chickpea|garbanzo|pea|legume|tofu|tempeh|edamame)\b/,
 nut:/\b(nut|nuts|peanut|almond|cashew|pistachio|walnut|pecan|seed|seeds|sunflower|pumpkin|sesame|tahini)\b/,
 sweet:/\b(sugar|syrup|honey|molasses|jam|jelly|marmalade|icing|sweetener|marshmallow)\b/,
 dessert:/\b(cake|pie|cookie|biscuit|donut|doughnut|pastry|brownie|pudding|jello|gelatin|dessert|sorbet|tart)\b/,
 candy:/\b(candy|chocolate|gummy|licorice|mint|sweets|toffee)\b/,
 snack:/\b(chip|chips|crisp|cracker|popcorn|pretzel|snack|puff|straw)\b/,
 beverage:/\b(drink|beverage|juice|lemonade|smoothie|cocktail)\b/,
 water:/\b(water|sparkling|tonic|seltzer)\b/,
 soda:/\b(soda|pop|cola|coke|ale|root beer|sprite|fizzy)\b/,
 coffee:/\b(coffee|espresso|cappuccino|latte)\b/,
 tea:/\b(tea|chai|chamomile|kombucha)\b/,
 oil:/\b(oil|vinegar|olive|canola|shortening)\b/,
 spice:/\b(spice|seasoning|salt|pepper|cinnamon|paprika|cumin|oregano|curry|chili powder|harissa)\b/,
 sauce:/\b(sauce|salsa|marinara|alfredo|gravy|marinade|hoisin|sriracha|soy|miso|paste|dressing|dip|hummus|tzatziki|guacamole)\b/,
 condiment:/\b(ketchup|mustard|mayonnaise|mayo|relish|pickle|horseradish|caper|sauerkraut|condiment)\b/,
 soup:/\b(soup|broth|stock|bisque|chowder)\b/,
 spread:/\b(spread|butter|nutella|hazelnut)\b/,
 baby:/\b(baby|infant|toddler|diaper|wipe|soother|pacifier|formula)\b/,
 pet:/\b(pet|dog|cat|kibble|litter|treat)\b/,
 paper:/\b(tissue|towel|napkin|toilet|bathroom|paper|foil|wrap|parchment|bag|container)\b/,
 cleaning:/\b(clean|cleaner|bleach|disinfect\w*|sanitiz\w*|detergent|dish|sponge|glove|drain|oven|freshener)\b/,
 laundry:/\b(laundry|softener|dryer|stain)\b/,
 hygiene:/\b(shampoo|conditioner|soap|toothpaste|toothbrush|floss|mouthwash|deodorant|antiperspirant|razor|shaving|lotion|sunscreen|body wash|sanitizer|swab)\b/,
 medicine:/\b(vitamin|multivitamin|tylenol|advil|ibuprofen|acetaminophen|bandage|antacid|allergy|antihistamine|cough|thermometer|medicine|tablet|caplet|first aid)\b/,
 hardware:/\b(bulb|battery|batteries|match|candle|light)\b/,
 baking:/\b(baking|yeast|cocoa|vanilla|cornstarch|breadcrumb|colouring|mix)\b/,
};
export const STATE={
 frozen:/\b(frozen|freezer|ice cream|popsicle|freezie|sorbet|ice)\b/,
 canned:/\b(canned|can|tin|jarred|jar)\b/,
 dried:/\b(dried|dry|instant|powder|crystals|sachet|mix)\b/,
 fresh:/\b(fresh|raw|crisp)\b/,
 prepared:/\b(prepared|deli|rotisserie|hot|ready|takeaway|platter|tray|sushi|sandwich)\b/,
 chilled:/\b(refrigerated|chilled|cold)\b/,
 breakfast:/\b(breakfast|cereal|pancake|waffle|porridge|oatmeal|granola|muesli|syrup|bran)\b/,
};

// Labels carry concepts too. Most resolve through the same patterns above; a
// few department words are idiomatic and need stating ("produce" means fresh
// fruit and vegetables; "pantry" means the shelf-stable shelf).
export const LABEL_SENSE={
 produce:['fruit','vegetable','herb','fresh'],
 pantry:['canned','dried','sauce','condiment','spice','oil','grain','pasta','legume','soup','baking'],
 bakery:['bread','dessert'],
 frozen:['frozen'],
 snacks:['snack','candy','nut','dessert'],
 beverages:['beverage','water','soda','coffee','tea','juice'],
 breakfast:['breakfast','grain'],
 deli:['prepared','sauce'],
 household:['paper','cleaning','laundry','hardware'],
 personal:['hygiene','medicine'],
 protein:['meat','poultry','fish','shellfish','legume'],
 seafood:['fish','shellfish'],
 eggs:['egg'],
 dairy:['dairy','cheese'],
 child:['baby'],
 pet:['pet'],
 prepared:['prepared'],
 alternatives:['dairy','beverage'],
 world:['sauce','spice'],
 international:['sauce','spice'],
 essentials:['hardware'],
 care:['hygiene'],
 health:['medicine'],
 storage:['paper'],
 supplies:['baking'],
 seasonings:['spice'],
 legumes:['legume'],
 grains:['grain'],
 noodles:['pasta'],
 salads:['vegetable','prepared'],
 dips:['sauce'],
 meals:['prepared'],
 counter:['prepared'],
 sweeteners:['sweet'],
 biscuits:['dessert'],
 cured:['meat'],
};

/** Tokens plus naive singulars, so a pattern for "bean" also sees "beans". */
function haystack(text){
 const tokens=text.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(Boolean);
 const all=new Set(tokens);
 for(const t of tokens){
  if(t.endsWith('ies'))all.add(t.slice(0,-3)+'y');
  if(t.endsWith('es'))all.add(t.slice(0,-2));
  if(t.endsWith('s'))all.add(t.slice(0,-1));
 }
 return ` ${[...all].join(' ')} `;
}

export function conceptsOf(text){
 const found=new Set();
 const lower=haystack(text);
 for(const [concept,pattern] of Object.entries(SUBSTANCE))if(pattern.test(lower))found.add(concept);
 for(const [state,pattern] of Object.entries(STATE))if(pattern.test(lower))found.add(state);
 return found;
}
export function labelConcepts(label){
 const found=conceptsOf(label);
 for(const word of label.toLowerCase().split(/[^a-z]+/))
  for(const sense of LABEL_SENSE[word]??[])found.add(sense);
 return found;
}
