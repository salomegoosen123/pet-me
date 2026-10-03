// chatReplies.ts – what your family (and Saydee) say back when you chat with them. They're not real people,
// so they look for words they know in what you said, and answer. Mia designed this game.

// who you can chat with
export type Talker = "mum" | "dad" | "brother" | "saydee";

// one kind of answer: the words that make them say it, and what each of them says
interface Answer {
  words: string[];
  mum: string;
  dad: string;
  brother: string;
  saydee: string;
}

// the answers they know, checked in this order. Copy one to teach them a new answer!
// A word with a * on the end means "any word that starts like this", so "hung*" is hungry, hunger, hungery...
const ANSWERS: Answer[] = [
  {
    words: ["follow*", "come"],
    mum: "Have fun, you two!", dad: "Off you go!", brother: "Okay, I'm coming! 🏃", saydee: "*runs to you* 🐾",
  },
  {
    words: ["stay", "stop", "wait"],
    mum: "Okay!", dad: "Righto!", brother: "Okay, I'll stay here! 👋", saydee: "*sits down* 🐕",
  },
  {
    words: ["hi", "hello", "hey", "howzit"],
    mum: "Hello sweetie! 😊", dad: "Howzit, my girl!", brother: "Hey! 👋", saydee: "Woof! 🐶",
  },
  {
    words: ["love"],
    mum: "I love you too! ❤️", dad: "Love you lots! ❤️", brother: "Love you too! 😊", saydee: "*licks your face* 💕",
  },
  {
    words: ["hung*", "food", "eat", "dinner", "treat*"],
    mum: "I'm cooking! 🍲", dad: "Ask Mum, she's cooking!", brother: "Me too! 😋", saydee: "Woof woof! 🦴🦴",
  },
  {
    words: ["play*", "game*", "walk*", "park"],
    mum: "Go and play with your brother!", dad: "After the rugby! 🏉", brother: "Yes! Let's play! 🎈",
    saydee: "*wags tail super fast* 🎾",
  },
  {
    words: ["bed", "tired", "sleep*", "night"],
    mum: "Sweet dreams! 😴", dad: "Night night! 🌙", brother: "I'm not tired! 😜", saydee: "*yawns* 😴",
  },
  {
    words: ["saydee", "dog*", "pup*"],
    mum: "Saydee is so cute! 🐶", dad: "Best dog ever! 🐕", brother: "Can I walk Saydee? 🐾", saydee: "Woof? 🐶",
  },
  {
    words: ["swim*", "pool", "bath"],
    mum: "Put your costume on first!", dad: "Last one in is a rotten egg!", brother: "Let's swim! 🏊",
    saydee: "*shakes water everywhere* 💦",
  },
  {
    words: ["sad", "cry*", "upset"],
    mum: "Come here for a hug! 🤗", dad: "Chin up, my girl! 💪", brother: "Don't be sad! Want to play? 🎈",
    saydee: "*snuggles up to you* 🐶💕",
  },
  {
    words: ["good girl", "good dog", "cute"],
    mum: "Thank you! 😊", dad: "Thanks! 😄", brother: "I know! 😎", saydee: "*spins round happily* 🐕💫",
  },
  {
    words: ["how are you"],
    mum: "I'm good, thank you!", dad: "Lekker, thanks!", brother: "Good! 😄", saydee: "Woof! 😊",
  },
  {
    words: ["bye"],
    mum: "Bye bye! 👋", dad: "Cheers! 👋", brother: "See ya! 👋", saydee: "*whines* 🥺",
  },
];

// what they say if they don't know any of your words: one of these, picked at random. Copy a line to add one more!
const DONT_KNOW: Record<Talker, string[]> = {
  mum: [
    "That's lovely! 😊",
    "Oh, really? 😮",
    "Tell me more! 💬",
    "You're so funny! 😄",
  ],
  dad: [
    "Ha ha, good one!",
    "Is that so? 🤔",
    "Lekker! 👍",
    "Ask your mum! 😄",
  ],
  brother: [
    "Cool! 😎",
    "Ha ha! 😂",
    "Really? 🤔",
    "Let's play instead! 🎈",
    "Awesome! 🤩",
    "No way! 😲",
  ],
  saydee: [
    "Woof! 🐶",
    "Woof woof!",
    "*tilts her head* 🐶",
    "*wags her tail* 🐕",
  ],
};

// the words that mean you're talking to someone in particular
const NAMES: Record<Talker, string[]> = {
  mum: ["mum", "mom", "mummy", "mommy", "mama", "ma"],
  dad: ["dad", "daddy", "papa", "pa"],
  brother: ["brother", "bro"],
  saydee: ["saydee", "sadie"],
};

// what everyone is called in the chat
export const CHAT_NAMES: Record<Talker, string> = { mum: "Mum", dad: "Dad", brother: "Your brother", saydee: "Saydee" };

const EVERYONE: Talker[] = ["mum", "dad", "brother", "saydee"];
const FOLLOW_WORDS: string[] = ["follow*", "come"]; // telling your brother to follow you
const STAY_WORDS: string[] = ["stay", "stop", "wait"]; // telling him to stop following
const HELP_WORDS: string[] = ["help*"]; // shouting for help, down in the bad guys' hideout

// this splits what you said into words
function wordsIn(lower: string): string[] {
  return lower.split(/[^a-z']+/);
}

// this says if you said a word (a whole word, so "hi" doesn't count inside "this"), a word that starts
// the same way (for words with a * on the end), or a few words together
function youSaid(lower: string, yourWords: string[], word: string): boolean {
  if (word.includes(" ")) return lower.includes(word);
  if (!word.endsWith("*")) return yourWords.includes(word);
  const start = word.slice(0, -1);
  for (const yours of yourWords) {
    if (yours.startsWith(start)) return true;
  }
  return false;
}

// this picks one of someone's "don't know" answers, at random
function somethingElse(who: Talker): string {
  const answers = DONT_KNOW[who];
  return answers[Math.floor(Math.random() * answers.length)];
}

// this says who you're talking to, if you said their name (or null if you didn't)
export function whoYouMean(said: string): Talker | null {
  const yourWords = wordsIn(said.toLowerCase());
  for (const who of EVERYONE) {
    for (const name of NAMES[who]) {
      if (yourWords.includes(name)) return who;
    }
  }
  return null;
}

// this says if you told your brother to follow you (true), to stop (false), or neither (null)
export function followOrStay(said: string): boolean | null {
  const lower = said.toLowerCase();
  const yourWords = wordsIn(lower);
  for (const word of STAY_WORDS) {
    if (youSaid(lower, yourWords, word)) return false;
  }
  for (const word of FOLLOW_WORDS) {
    if (youSaid(lower, yourWords, word)) return true;
  }
  return null;
}

// this says if you shouted for help
export function askedForHelp(said: string): boolean {
  const lower = said.toLowerCase();
  const yourWords = wordsIn(lower);
  for (const word of HELP_WORDS) {
    if (youSaid(lower, yourWords, word)) return true;
  }
  return false;
}

// this says what someone answers to what you said
export function replyTo(said: string, who: Talker): string {
  const lower = said.toLowerCase();
  const yourWords = wordsIn(lower);
  for (const answer of ANSWERS) {
    for (const word of answer.words) {
      if (youSaid(lower, yourWords, word)) return answer[who];
    }
  }
  return somethingElse(who);
}
