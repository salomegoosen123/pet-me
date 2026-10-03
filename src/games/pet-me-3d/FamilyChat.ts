// FamilyChat.ts – chatting with your family (and Saydee) at home: your words pop up over your head, and the one
// you named (or whoever is closest) answers in a bubble over theirs. It's all written in the chat under the game too.
// Mia designed this game.
import type { Object3D, Scene } from "three";
import { CHAT_NAMES, followOrStay, replyTo, whoYouMean } from "./chatReplies";
import type { Talker } from "./chatReplies";
import type { Dog3D } from "./Dog3D";
import type { Person3D } from "./Person3D";
import { SpeechBubble3D } from "./SpeechBubble3D";

const ANSWER_AFTER: number = 1; // they think for a second before they answer
const CHAT_LINES: number = 6; // how many lines the chat under the game keeps
const ABOVE_A_PERSON: number = 2.9; // how far above a grown-up's feet their bubble floats (a child's is lower)
const ABOVE_SAYDEE: number = 1.3; // how far above Saydee's paws her bubble floats

// someone you can chat with: who they are, where they are, and their speech bubble
interface ChatFriend {
  model: Object3D;
  above: number; // how far above them their bubble floats
  talker: Talker;
  bubble: SpeechBubble3D;
}

// this adds a line to the chat under the game, and forgets the oldest lines
function writeInChat(chat: string[], line: string): void {
  chat.push(line);
  while (chat.length > CHAT_LINES) chat.shift();
}

// this says how far above someone their bubble floats, for their size
function aboveThem(person: Person3D): number {
  return ABOVE_A_PERSON * person.model.scale.y;
}

// FamilyChat has your speech bubble and everyone else's, and waits a moment before they answer
export class FamilyChat {
  yourBubble: SpeechBubble3D;
  friends: ChatFriend[];
  answerer: ChatFriend | null; // who is going to answer you
  answer: string; // what they are going to say
  answerIn: number; // how long until they say it
  chat: string[]; // the chat under the game

  constructor(people: Person3D[], talkers: Talker[]) {
    this.yourBubble = new SpeechBubble3D();
    this.friends = [];
    for (let i = 0; i < people.length; i++) {
      this.friends.push({ model: people[i].model, above: aboveThem(people[i]), talker: talkers[i], bubble: new SpeechBubble3D() });
    }
    this.answerer = null;
    this.answer = "";
    this.answerIn = 0;
    this.chat = [];
  }

  // this lets you chat with Saydee too
  addSaydee(dog: Dog3D): void {
    this.friends.push({ model: dog.model, above: ABOVE_SAYDEE, talker: "saydee", bubble: new SpeechBubble3D() });
  }

  // this puts all the speech bubbles in the home (they stay hidden until someone talks)
  start(scene: Scene): void {
    scene.add(this.yourBubble.model);
    for (const friend of this.friends) scene.add(friend.bubble.model);
  }

  // this shows what you said, and gets someone ready to answer: the one you named, or whoever is closest
  youSay(words: string, you: Person3D, chat: string[]): void {
    this.youSayAlone(words, chat);
    let named = whoYouMean(words);
    if (named == null && followOrStay(words) != null) named = "brother"; // "follow me" and "stay" are for your brother
    const answerer = named == null ? this.closestTo(you) : this.called(named);
    if (answerer == null) return;
    this.answerer = answerer;
    this.answer = replyTo(words, answerer.talker);
    this.answerIn = ANSWER_AFTER;
  }

  // this shows what you said, and writes it in the chat, but nobody answers (like down in the bad guys' hideout)
  youSayAlone(words: string, chat: string[]): void {
    this.chat = chat;
    this.yourBubble.say(words);
    writeInChat(chat, "You: " + words);
  }

  // this finds whoever is closest to you
  closestTo(you: Person3D): ChatFriend | null {
    let closest: ChatFriend | null = null;
    for (const friend of this.friends) {
      const away = friend.model.position.distanceTo(you.model.position);
      if (closest == null || away < closest.model.position.distanceTo(you.model.position)) closest = friend;
    }
    return closest;
  }

  // this finds the one with that name
  called(talker: Talker): ChatFriend | null {
    for (const friend of this.friends) {
      if (friend.talker === talker) return friend;
    }
    return null;
  }

  // this keeps the bubbles over everyone's heads, and has the answer pop up after a moment
  update(you: Person3D, seconds: number): void {
    this.yourBubble.follow(you.model, aboveThem(you), seconds);
    for (const friend of this.friends) friend.bubble.follow(friend.model, friend.above, seconds);
    if (this.answerer == null) return;
    this.answerIn = this.answerIn - seconds;
    if (this.answerIn > 0) return;
    this.answerer.bubble.say(this.answer);
    writeInChat(this.chat, CHAT_NAMES[this.answerer.talker] + ": " + this.answer);
    this.answerer = null;
  }

  // this throws the bubbles away when the game closes
  stop(): void {
    this.yourBubble.throwAway();
    for (const friend of this.friends) friend.bubble.throwAway();
  }
}
