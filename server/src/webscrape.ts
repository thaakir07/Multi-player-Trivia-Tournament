import 'dotenv/config';
import fetch from "node-fetch";
import { JSDOM } from "jsdom";


export function decode(str: string): string {
  return new JSDOM(str).window.document.body.textContent || "";
}


const catMap: Record<string, number> = {
  "General Knowledge": 9,
  "Entertainment: Books": 10,
  "Entertainment: Film": 11,
  "Entertainment: Music": 12,
  "Entertainment: Musicals & Theatres": 13,
  "Entertainment: Television": 14,
  "Entertainment: Video Games": 15,
  "Entertainment: Board Games": 16,
  "Science & Nature": 17,
  "Science: Computers": 18,
  "Science: Mathematics": 19,
  "Mythology": 20,
  "Sports": 21,
  "Geography": 22,
  "History": 23,
  "Politics": 24,
  "Art": 25,
  "Celebrities": 26,
  "Animals": 27,
  "Vehicles": 28,
  "Entertainment: Comics": 29,
  "Science: Gadgets": 30,
  "Entertainment: Japanese Anime & Manga": 31,
  "Entertainment: Cartoon & Animations": 32
};

// tsconfig.json should have "esModuleInterop": true
export interface Question {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface Trivia {
  results: Question[];
}

export async function scrapeAndPostTrivia(amount: number, diff: string, cat: string) {
  const max = "https://opentdb.com/api_count.php?category="+catMap[cat];
  const resmax = await fetch(max);
  let mx: any = await resmax.json();
  mx = mx.category_question_count;

  if (diff === "easy") {
    amount = mx.total_easy_question_count < amount ? mx.total_easy_question_count : amount;
  } else if (diff === "medium") {
    amount = mx.total_medium_question_count < amount ? mx.total_medium_question_count : amount;
  } else {
    amount = mx.total_hard_question_count < amount ? mx.total_hard_question_count : amount;
  }

  const url = "https://opentdb.com/api.php?amount="+
            (amount)+"&category="+catMap[cat]+"&difficulty="+
            diff.toLowerCase()+"&type=multiple";
  console.log(url);
  const response = await fetch(url);
  const questions: Trivia = (await response.json()) as Trivia;

  const decodedResults = questions.results.map((q) => ({
    ...q,
    question: decode(q.question),
    correct_answer: decode(q.correct_answer),
    incorrect_answers: q.incorrect_answers.map(a => decode(a)),
    category: decode(q.category),
  }));

  const res = await fetch("http://localhost:3000/api/addQuestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(decodedResults),
  });

  const data = await res.json() as { message: string };

  console.log(data.message);
}