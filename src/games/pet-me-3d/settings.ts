// settings.ts – the knobs for Pet Me 3D. Mia designed this game.
// Change a number or a colour, save, then press Play to see what happens!

export const GAME_NAME: string = "pet-me-3d"; // the name of this game's folder
export const TICK_MS: number = 1000; // how often the game moves, in thousandths of a second
export const PET_NAME: string = "Saydee"; // your dog's name
export const PUPPY_SIZE: number = 0.6; // how big she is (1 is a grown-up dog)
export const HEAD_WIDTH: number = 0.95; // how wide her head is (bigger is wider)
export const HUNGER_START: number = 100; // how full her tummy is at the start
export const HUNGER_DROP: number = 30; // how much hunger goes down every minute
export const FEED_AMOUNT: number = 50; // how much one bowl of food fills her tummy
export const WATER_START: number = 100; // how much water she has at the start
export const WATER_DROP: number = 30; // how much water goes down every minute
export const DRINK_AMOUNT: number = 50; // how much one drink fills her up
export const WALK_SECONDS: number = 9; // how long she takes to walk to her bowl or the bath (the bowls are further away now)
export const SLEEP_START: number = 100; // how rested she is at the start
export const SLEEP_DROP: number = 15; // how much her sleep bar goes down every minute
export const SLEEP_AMOUNT: number = 40; // how much one sleep fills her sleep bar
export const SLEEP_SECONDS: number = 6; // how long she sleeps for
export const EAT_SECONDS: number = 3; // how long she eats for
export const LOW_AT: number = 30; // below this, a bar turns red
export const FULL_COLOUR: string = "limegreen"; // the bar colour when it is full
export const LOW_COLOUR: string = "tomato"; // the bar colour when it is low
export const FUR_COLOUR: string = "white"; // the colour of Saydee's fur
export const EAR_COLOUR: string = "white"; // the colour of her little pitbull ears
export const SPOT_COLOUR: string = "hotpink"; // the colour of her spots
export const SPOT_SIZE: number = 0.13; // how big her spots are
export const SNOUT_COLOUR: string = "navajowhite"; // the colour of her snout
export const NOSE_COLOUR: string = "black"; // the colour of her nose and eyes
export const WAG_SPEED: number = 8; // how fast she wags her tail
export const BED_COLOUR: string = "mediumorchid"; // the colour of her bed
export const BOWL_COLOUR: string = "crimson"; // the colour of her food bowl
export const FOOD_COLOUR: string = "chocolate"; // the colour of the food in her bowl
export const FOOD_BITS: number = 25; // how many bits of food are in her bowl
export const WATER_BOWL_COLOUR: string = "royalblue"; // the colour of her water bowl
export const WATER_COLOUR: string = "deepskyblue"; // the colour of the water in it
export const FLOOR_COLOUR: string = "burlywood"; // the colour of the floor
export const KITCHEN_FLOOR_COLOUR: string = "lightgray"; // the colour of the kitchen tiles
export const KITCHEN_WALL_COLOUR: string = "mistyrose"; // the colour of the kitchen wall
export const COUNTER_COLOUR: string = "white"; // the colour of the kitchen counter
export const COUNTER_TOP_COLOUR: string = "slategray"; // the colour of the top of the counter
export const SOUP_COLOUR: string = "orange"; // the colour of the soup Mum cooks
export const COOKING_SECONDS: number = 5; // how long Mum cooks before the food is ready
export const DINNER_SECONDS: number = 8; // how long it takes to eat a plate of food at dinner
export const FRIDGE_COLOUR: string = "silver"; // the colour of the fridge
export const TABLE_COLOUR: string = "saddlebrown"; // the colour of the kitchen table
export const CHAIR_COLOUR: string = "peru"; // the colour of the chairs
export const SOFA_COLOUR: string = "teal"; // the colour of the sofa
export const RUG_COLOUR: string = "orchid"; // the colour of the living room rug

// who is in the cartoons on the TV. Copy a line to add one more!
export const CARTOON_CHARACTERS: string[] = [
  "🐶",
  "🦄",
  "🐱",
  "🐸",
];

// the colours behind the cartoons on the TV
export const CARTOON_COLOURS: string[] = ["skyblue", "pink", "lightgreen", "gold"];
export const SNACK_COLOUR: string = "red"; // the colour of the apple from the fridge
export const SNACK_EAT_SECONDS: number = 4; // how long you take to eat your snack
export const SNACK_BITES: number = 4; // how many bites your snack takes
export const CARPET_COLOUR: string = "plum"; // the colour of the bedroom carpet
export const BEDROOM_WALL_COLOUR: string = "lavender"; // the colour of the bedroom wall
export const BEDCOVER_COLOUR: string = "hotpink"; // the colour of the blanket on your bed
export const BROTHER_BEDCOVER_COLOUR: string = "deepskyblue"; // the colour of the blanket on your brother's bed
export const WARDROBE_COLOUR: string = "burlywood"; // the colour of the wardrobe, bed and bedside table
export const LAMP_COLOUR: string = "gold"; // the colour of the lampshade
export const NIGHT_COLOUR: string = "midnightblue"; // how dark it gets when you go to sleep
export const PARENTS_CARPET_COLOUR: string = "thistle"; // the colour of the carpet in your parents' room
export const PARENTS_WALL_COLOUR: string = "peachpuff"; // the colour of your parents' room walls
export const PARENTS_BEDCOVER_COLOUR: string = "cornflowerblue"; // the colour of the blanket on your parents' bed
export const PLAYROOM_CARPET_COLOUR: string = "lemonchiffon"; // the colour of the play room carpet
export const PLAYROOM_WALL_COLOUR: string = "lightpink"; // the colour of the play room walls
export const TOY_BOX_COLOUR: string = "tomato"; // the colour of the toy box
export const TEDDY_COLOUR: string = "peru"; // the colour of the teddy
export const PRESENT_COLOUR: string = "mediumturquoise"; // the colour of the wrapping paper on the present
export const RIBBON_COLOUR: string = "gold"; // the colour of the ribbon and bow on the present
export const TOY_CAR_COLOUR: string = "red"; // the colour of the toy car inside the present
export const TENT_COLOUR: string = "mediumpurple"; // the colour of the play tent
export const BALL_COUNT: number = 80; // how many balls are in the ball pit

// the colours of the balls in the ball pit. Copy a line to add one more!
export const BALL_PIT_COLOURS: string[] = [
  "red",
  "gold",
  "deepskyblue",
  "limegreen",
  "hotpink",
];

export const HOUSE_SIZE: number = 1.5; // how big the house and its rooms are (1 was the first, smaller house)
export const FENCE_COLOUR: string = "white"; // the colour of the fence round the back yard
export const DOGHOUSE_COLOUR: string = "hotpink"; // the colour of Saydee's doghouse
export const DOGHOUSE_ROOF_COLOUR: string = "purple"; // the colour of the doghouse roof
export const POOL_WATER_COLOUR: string = "deepskyblue"; // the colour of the water in the pool
export const POOL_FLOAT_COLOUR: string = "hotpink"; // the colour of the swimming ring floating in the pool
export const YARD_FLOWER_COUNT: number = 30; // how many flowers grow in the back yard
export const HOUSE_WALL_COLOUR: string = "wheat"; // the colour of the outside walls
export const DOOR_COLOUR: string = "saddlebrown"; // the colour of the doors
export const DOOR_OPEN_DISTANCE: number = 1.2; // walk this close to a door, and it opens (right in the doorway)
export const DOOR_SPEED: number = 5; // how fast the doors swing open and shut
export const BUTTON_COLOUR: string = "deeppink"; // the colour of the buttons that pop up on Saydee's things
export const BUTTON_SIZE: number = 3; // how big those buttons are
export const BUTTON_POP_DISTANCE: number = 2.2; // walk this close to a thing, and its button pops up
export const ROOF_COLOUR: string = "firebrick"; // the colour of the roof
export const HOUSE_WALL_HEIGHT: number = 3.5; // how tall the outside walls are
export const ROOF_HEIGHT: number = 6; // how tall and pointy the roof is
export const TREAT_COLOUR: string = "sienna"; // the colour of Saydee's meaty treat
export const TREAT_AMOUNT: number = 10; // how much a treat fills her tummy
export const BATH_SECONDS: number = 5; // how long Saydee stays in her bath
export const BATH_FLOOR_COLOUR: string = "lightcyan"; // the colour of the bathroom tiles
export const BATH_WALL_COLOUR: string = "powderblue"; // the colour of the bathroom wall
export const BATH_COLOUR: string = "white"; // the colour of the bath
export const BATH_WATER_COLOUR: string = "deepskyblue"; // the colour of the bath water
export const BUBBLE_COLOUR: string = "lavender"; // the colour of the bubbles
export const BUBBLE_COUNT: number = 15; // how many bubbles there are
export const TOILET_COLOUR: string = "white"; // the colour of the toilet and the sink
export const WALL_COLOUR: string = "lightblue"; // the colour behind everything
export const AUTO_SPIN: number = 0; // how fast the room spins by itself (0 means it stays still)
export const CAMERA_HEIGHT: number = 7; // how high up the camera starts, looking down at you
export const CAMERA_BACK: number = 5; // how far behind you the camera starts
export const COLLAR_COLOUR: string = "red"; // the colour of her collar
export const LEASH_COLOUR: string = "red"; // the colour of her leash
export const LEASH_LENGTH: number = 1.6; // how far from you she walks on her leash
export const WALK_AROUND_SPEED: number = 0.6; // how fast she walks around you in the park
export const YOU_SPEED: number = 2.5; // how fast you walk with the arrow keys
export const JUMP_HEIGHT: number = 5; // how high you jump when you press the space bar
export const JUMP_SECONDS: number = 0.6; // how long a jump takes, from jumping up to landing
export const BUBBLE_SECONDS: number = 4; // how long a speech bubble stays when someone talks in the chat
export const FOLLOW_DISTANCE: number = 1.6; // how far behind you she trots
export const FOLLOW_SECONDS: number = 2; // at home, how long she waits after you stop before going back to bed
export const SKY_COLOUR: string = "lightskyblue"; // the colour of the sky in the park
export const GRASS_COLOUR: string = "yellowgreen"; // the colour of the grass
export const TRUNK_COLOUR: string = "sienna"; // the colour of the tree trunks
export const LEAVES_COLOUR: string = "forestgreen"; // the colour of the leaves
export const TREE_COUNT: number = 8; // how many trees are in the park
export const FLOWER_COUNT: number = 40; // how many flowers are on the grass
export const SLIDE_COLOUR: string = "orange"; // the colour of the slide in the playground
export const SLIDE_HEIGHT: number = 2.4; // how tall the slide is (it was 1.4)
export const CLIMB_SPEED: number = 1.5; // how fast you climb up the slide ladder
export const SLIDE_SECONDS: number = 1.2; // how long you take to whoosh down the slide
export const SWING_COLOUR: string = "red"; // the colour of the swing seats
export const SWING_HIGH: number = 0.8; // how high you swing (bigger is higher)
export const SWING_SPEED: number = 2.4; // how fast you swing back and forth
export const SEESAW_COLOUR: string = "royalblue"; // the colour of the seesaw
export const SEESAW_SPEED: number = 2; // how fast the seesaw goes up and down
export const BENCH_COLOUR: string = "saddlebrown"; // the colour of the park bench

// the colours of the jungle gym bars. Copy a line to add one more!
export const JUNGLE_GYM_COLOURS: string[] = [
  "red",
  "gold",
  "limegreen",
  "deepskyblue",
];

export const HAIR_COLOUR: string = "saddlebrown"; // the colour of your hair
export const SKIN_COLOUR: string = "peachpuff"; // the colour of your skin
export const SHIRT_COLOUR: string = "hotpink"; // the colour of your shirt
export const PANTS_COLOUR: string = "royalblue"; // the colour of your pants
export const YOU_SIZE: number = 0.7; // how big you are (1 is a grown-up, 0.7 is a child, 0.4 is a baby)
export const BROTHER_SIZE: number = 0.7; // how big your brother is
export const SAYDEE_RIDE_SPEED: number = 2.5; // how fast Saydee walks when you ride on her back
export const BAD_GUY_SPEED: number = 3; // how fast the bad guys at the park sneak up on you when Saydee's away
export const NIGHT_BAD_GUYS_SECONDS: number = 5; // how long you're asleep before the bad guys sneak in
export const POLICE_COLOUR: string = "navy"; // the colour of the police uniforms, and the stripe on the police car
export const POLICE_CAR_COLOUR: string = "white"; // the colour of the police car
export const WOLF_COLOUR: string = "gray"; // the colour of the wolf in the bad guys' base
export const SCHOOL_SECONDS: number = 120; // how long your brother is at school
export const SCHOOL_COLOUR: string = "firebrick"; // the colour of the school's brick walls
export const SCHOOL_BAG_COLOUR: string = "orange"; // the colour of your brother's school bag
export const YOUR_SCHOOL_BAG_COLOUR: string = "hotpink"; // the colour of your school bag
export const SCHOOL_CHILDREN: number = 7; // how many children are in your brother's class (as well as him)
export const SCHOOL_UNIFORM_TOP: string = "forestgreen"; // the colour of the school uniform's top
export const SCHOOL_UNIFORM_BOTTOMS: string = "gray"; // the colour of the school uniform's bottoms
export const SCHOOL_DESK_COLOUR: string = "burlywood"; // the colour of the desks and chairs at school
export const TEACHER_SHIRT_COLOUR: string = "teal"; // the colour of the teacher's shirt
export const SCHOOL_BULLIES: number = 2; // how many of the children in class are bullies (the rest are smart children)
export const GLASSES_COLOUR: string = "black"; // the colour of the smart children's round glasses
export const BOOK_COLOURS: string[] = [ // the colours of the smart children's books
  "royalblue",
  "crimson",
  "seagreen",
  "darkorange",
  "purple",
];
export const BULLY_CAP_COLOUR: string = "red"; // the colour of the bullies' caps (they wear them backwards)
export const BULLY_SECONDS: number = 8; // how often a bully says something mean, while you're in class
export const BULLY_WORDS: string[] = [ // the mean things the bullies say (copy a line to add one)
  "Ha ha, you're slow! 😝",
  "Your bag is silly! 😛",
  "You can't sit here! 😝",
];
export const DAYCARE_COLOUR: string = "pink"; // the colour of the daycare's walls
export const DAYCARE_ROOF_COLOUR: string = "mediumpurple"; // the colour of the daycare's roof
export const STAR_COLOUR: string = "gold"; // the colour of the star stickers Mum gives you for tidying up
export const FOUNTAIN_SECONDS: number = 3; // how long the toy fountain goes when you press Fountain
export const MOST_TOYS_OUT: number = 25; // the most toys that can be out of the toy box at once
export const TOY_COLOURS: string[] = [ // the colours of the toys in the toy box
  "red",
  "dodgerblue",
  "gold",
  "limegreen",
  "orange",
];
export const BALLS_FLY_OUT_SECONDS: number = 0.4; // how often a ball flies out of the ball pit while you bounce in it
export const MOST_BALLS_OUT: number = 20; // the most balls that can be out of the pit at once (then you tidy up!)
export const TOWER_MOST_BLOCKS: number = 15; // how many blocks tall your tower in the play room can go
export const TOWER_BLOCK_COLOURS: string[] = [
  "red",
  "orange",
  "gold",
  "limegreen",
  "dodgerblue",
  "mediumpurple",
];
export const DAYCARE_CHILDREN: number = 8; // how many children play at the daycare
export const DAYCARE_TABLE_COLOUR: string = "white"; // the colour of the little tables at the daycare
export const DAYCARE_CHAIR_COLOURS: string[] = [
  "tomato",
  "gold",
  "limegreen",
  "deepskyblue",
];
export const DAYCARE_SHIRT_COLOURS: string[] = [
  "tomato",
  "gold",
  "limegreen",
  "deepskyblue",
  "violet",
  "orange",
];
export const BROTHER_HAIR_COLOUR: string = "saddlebrown"; // the colour of your brother's hair
export const BROTHER_SHIRT_COLOUR: string = "limegreen"; // the colour of your brother's shirt
export const BROTHER_FOLLOWS_YOU: boolean = false; // does your brother follow you when the game starts? (true yes, false no) Say "follow me" or "stay" in the chat to change it
export const OUMA_HAIR_COLOUR: string = "silver"; // the colour of Ouma's hair
export const OUMA_SHIRT_COLOUR: string = "plum"; // the colour of Ouma's top
export const OUPA_HAIR_COLOUR: string = "white"; // the colour of Oupa's hair
export const OUPA_SHIRT_COLOUR: string = "olivedrab"; // the colour of Oupa's shirt
export const CAR_COLOUR: string = "royalblue"; // the colour of Ouma and Oupa's car
export const COTTAGE_COLOUR: string = "lightyellow"; // the colour of Ouma and Oupa's cottage
export const COTTAGE_ROOF_COLOUR: string = "brown"; // the colour of the cottage roof
export const COTTAGE_FLOOR_COLOUR: string = "tan"; // the colour of the wooden floor inside the cottage

// the colours of the blankets on the three beds in the cottage. Copy a line to add one more!
export const COTTAGE_BED_COLOURS: string[] = [
  "hotpink",
  "dodgerblue",
  "mediumseagreen",
];
export const MUM_HAIR_COLOUR: string = "sienna"; // the colour of your mum's hair
export const MUM_SHIRT_COLOUR: string = "orchid"; // the colour of your mum's shirt
export const DAD_HAIR_COLOUR: string = "black"; // the colour of your dad's hair
export const DAD_SHIRT_COLOUR: string = "steelblue"; // the colour of your dad's shirt
export const FAMILY_WALK_SPEED: number = 1.5; // how fast your family walks round the house (you walk at 2.5)
export const FAMILY_WAIT_SECONDS: number = 6; // about how long they stay in a place before walking somewhere else

export const BEACH_SKY_COLOUR: string = "skyblue"; // the colour of the sky at the beach
export const SAND_COLOUR: string = "khaki"; // the colour of the sand
export const SEA_COLOUR: string = "dodgerblue"; // the colour of the sea
export const FRIEND_COUNT: number = 4; // how many people walk their dogs on the beach
export const FRIEND_DOG_SIZE: number = 0.8; // how big their dogs are (Saydee is 0.6)
export const DIG_EVERY: number = 10; // how many seconds between Saydee's digs at the beach
export const DIG_SECONDS: number = 3; // how long she digs for
export const HOLE_COLOUR: string = "sienna"; // the colour of the wet sand at the bottom of a hole
export const SAND_PILE_COLOUR: string = "burlywood"; // the colour of the sand she kicks out
export const NOTICE_DISTANCE: number = 5; // how close another dog has to be before Saydee wants to go to it
export const PULL_LENGTH: number = 2.2; // how far she stretches her leash when she pulls
export const ZOOM_SPEED: number = 7; // how fast Saydee zooms around the park when she's off her leash
export const SNIFF_SECONDS: number = 2; // how long she sniffs a tree or a flower
export const FRISBEE_COLOUR: string = "orangered"; // the colour of Saydee's frisbee
export const FRISBEE_DISTANCE: number = 9; // how far you throw the frisbee
export const BONE_COLOUR: string = "ivory"; // the colour of Saydee's squeaky bone
export const BONE_SQUEAKS: boolean = false; // does Saydee's bone squeak? (true means yes, false means no)
export const SQUEAK_SECONDS: number = 3; // how many seconds between squeaks
export const SQUEAK_PITCH: number = 1600; // how high the squeak is (bigger is higher and squeakier)

export const FAMILY_UMBRELLA_COLOUR: string = "orange"; // the colour of your family's big beach umbrella
export const SWIMSUIT_COLOUR: string = "deeppink"; // the colour of your swimming costume at the beach
export const PJS_COLOUR: string = "lightpink"; // the colour of your PJs
export const BROTHER_PJS_COLOUR: string = "dodgerblue"; // the colour of your brother's PJs
export const MUM_PJS_COLOUR: string = "red"; // the colour of Mum's PJs
export const DAD_PJS_COLOUR: string = "darkblue"; // the colour of Dad's PJs
export const BROTHER_SWIMSUIT_COLOUR: string = "dodgerblue"; // the colour of your brother's swimming costume
export const CASTLE_COLOUR: string = "burlywood"; // the colour of the sandcastle (wet sand is a bit darker)
export const CASTLE_FLAG_COLOUR: string = "hotpink"; // the colour of the flag on top of the sandcastle

// the colours of your family's beach towels: Mum's, your brother's, Dad's, and yours
export const TOWEL_COLOURS: string[] = [
  "hotpink",
  "turquoise",
  "gold",
  "violet",
];

// the colours of the beach umbrellas. Copy a line to add one more!
export const UMBRELLA_COLOURS: string[] = [
  "red",
  "yellow",
  "hotpink",
];

// the colours of the other dogs at the beach. Copy a line to add one more!
export const FRIEND_DOG_COLOURS: string[] = [
  "black",
  "saddlebrown",
  "gold",
  "gray",
];

// the colours of the other people's shirts, hair and skin at the beach
export const FRIEND_SHIRT_COLOURS: string[] = ["tomato", "limegreen", "orange", "purple"];
export const FRIEND_HAIR_COLOURS: string[] = ["black", "saddlebrown", "gold", "firebrick"];
export const FRIEND_SKIN_COLOURS: string[] = ["sienna", "peachpuff", "tan", "saddlebrown"];

// the colours of the flowers in the park. Copy a line to add one more!
export const FLOWER_COLOURS: string[] = [
  "hotpink",
  "gold",
  "white",
  "violet",
];
