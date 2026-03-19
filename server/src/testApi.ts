// testApi.ts
import 'dotenv/config';
import fetch from "node-fetch";
type Question = {
  id: number;
  question: string;
  answer: string;
  difficulty: string;
};
type NewQuestion = {
  categories: string[];
  question: string;
  difficulty: string;
  answer: string;
  options: string[];
}

//Test user creation
async function test1() {
  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "Big Dick Admin",
      email: "test@bigdickenergy.com",
      password: "bigdickenergy",
      avatar_url: "https://example.com/avatar.jpg",
      role: "user",
    }),
  });
  console.log(await res.json());
}

//Test user login
async function test2() {
  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "testAdmin",
      password: "mypassword123",
    }),
  });
  console.log(await res.json());
}

//Test token
async function test3() {

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InJhZWV6IiwiZW1haWwiOiJAZ21haWwiLCJpYXQiOjE3NTk0OTczOTAsImV4cCI6MTc1OTQ5NzQ1MH0.cAWkAgAe13CQhEtpfjEAfS9RblcaSwIDUzMSKXWeVmo';
  const res = await fetch("http://localhost:3000/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      username: "raeez",
      password: "password123",
    }),
  })
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Test edit username
async function test4() {

  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjIsInVzZXJuYW1lIjoicmFlZXoiLCJlbWFpbCI6IkBnbWFpbCIsImlhdCI6MTc1OTUxNjc3NCwiZXhwIjoxNzU5NTIwMzc0fQ.HBpJQvoreaXKhR9WhqkU8CSk2iRshPVxNU0rQ7dz7NY';
  const res = await fetch("http://localhost:3000/api/editUsername", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      newUsername: "raees",
    }),
  })
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Test edit password
async function test5() {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjIsInVzZXJuYW1lIjoicmFlZXMiLCJlbWFpbCI6IkBnbWFpbCIsImlhdCI6MTc1OTUyMTI5NCwiZXhwIjoxNzU5NTI0ODk0fQ.Oyx7wTf9Oz8uYXGzpgc7fPbrg_d9E9P7cdwfxKKfzHc';
  const res = await fetch("http://localhost:3000/api/editPassword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      newPassword: "helloWorld",
    }),
  })
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//test edit image
async function test17() {
  const token = "";
  const res = await fetch("http://localhost:3000/api/editImage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      newImage: "https://example.com/new-avatar.jpg",
    }),
  })
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Admin tests
//Create Admin
async function test6() {
  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: "testAdmin",
      email: "testAdmin@example.com",
      password: "mypassword123",
      avatar_url: "https://example.com/avatar.jpg",
      role: "admin",
    }),
  });
  console.log(await res.json());
}

async function test7() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjksInVzZXJuYW1lIjoidGVzdEFkbWluIiwiZW1haWwiOiJ0ZXN0QWRtaW5AZXhhbXBsZS5jb20iLCJpYXQiOjE3NTk5MjQ4NjQsImV4cCI6MTc1OTkyODQ2NH0.cFshKyjvFe5WTWVS53bSqGr6-pXJOSGvV0wr-UUuRmo";
  const res = await fetch("http://localhost:3000/api/deleteUser", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      role: "admin",
      username: "testAdmin1" }),
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

//Delete Question
async function test8() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMzQ3ODExLCJleHAiOjE3NjAzNTE0MTF9.3mGya0GsduRBnwQ8eT_9DqSpLOlOfRXuGsTEUBzz9gQ";
  const res = await fetch("http://localhost:3000/api/deleteQuestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      role: "admin",
      questionId: 36
    }),
  })
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Get All Questions
async function test9() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMzQ3ODExLCJleHAiOjE3NjAzNTE0MTF9.3mGya0GsduRBnwQ8eT_9DqSpLOlOfRXuGsTEUBzz9gQ";
  const res = await fetch("http://localhost:3000/api/getAllQuestions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Get a question by search
async function test10() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMjAzMjc1LCJleHAiOjE3NjAyMDY4NzV9.Q5aLvKVMsOJ2jqqikqoS2rJZF4K3gciJ4hCPNxYv58s";
  const res = await fetch("http://localhost:3000/api/getQuestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ search: "male" }),
  });

  const data: Question[] = await res.json() as Question[];
  console.log("Raw Response:", JSON.stringify(data, null, 2));

  if (data && data.length > 0) {
    const firstQuestion = data[0]!;
    console.log("Question:", firstQuestion.question);
    console.log("Answer:", firstQuestion.answer);
    console.log("Difficulty:", firstQuestion.difficulty);
  } else {
    console.log("No questions found");
  }
}

//Get a question by category
async function test11() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMjAzMjc1LCJleHAiOjE3NjAyMDY4NzV9.Q5aLvKVMsOJ2jqqikqoS2rJZF4K3gciJ4hCPNxYv58s";
  const res = await fetch("http://localhost:3000/api/getCategory", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      categoryName: "Sports"
    }),
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}

//test difficulty search
async function test12() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMjAzMjc1LCJleHAiOjE3NjAyMDY4NzV9.Q5aLvKVMsOJ2jqqikqoS2rJZF4K3gciJ4hCPNxYv58s";
  const res = await fetch("http://localhost:3000/api/getDifficulty", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      search: "hard"
    }),
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", data);
}

//Edit a question
async function test13() {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMjAzMjc1LCJleHAiOjE3NjAyMDY4NzV9.Q5aLvKVMsOJ2jqqikqoS2rJZF4K3gciJ4hCPNxYv58s";
    const res = await fetch("http://localhost:3000/api/getQuestion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ search: "male" }),
    });
  
    const data: Question[] = await res.json() as Question[];
    console.log("Raw Response:", JSON.stringify(data, null, 2));

    if (data && data.length > 0) {
        const firstQuestion = data[0]!;
        console.log("Question:", firstQuestion.question);
        console.log("Answer:", firstQuestion.answer);
        console.log("Difficulty:", firstQuestion.difficulty);
        // Update the answer
        const newAnswer = "Thaakir Fernandez";

        const res2 = await fetch("http://localhost:3000/api/editQuestion", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`    
            },
            body: JSON.stringify({
              role: "admin",
              questionid: firstQuestion.id,
              question: firstQuestion.question,
              options: ["Option1", "Option2", "Option3", "Option4"],
              answer: newAnswer
            }),
          });
        
          const data2 = await res2.json();
          console.log("Edit Status:", res2.status);
          console.log("Edited Response:", JSON.stringify(data2, null, 2));
    } else {
        console.log("No questions found");
    }
    
}

//Create a question
async function test14() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMjA4Njk0LCJleHAiOjE3NjAyMTIyOTR9.XhrnFuDjk0LZswoOL8zADXc3k8WqvxpqBInsu1s7qCI";
  const question: NewQuestion = {
    categories: ["General Knowledge"],
    question: "Who is the GOAT?",
    difficulty: "medium",
    answer: "Thaakir",
    options: ["Thaakir", "Tasreeq", "Leesan", "Deon", "Raeez"]
  };
  const res = await fetch("http://localhost:3000/api/createQuestion", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      role: "admin",
      question: question
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Response:", JSON.stringify(data, null, 2));
}

//Create a category
async function test15() {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGF5ZXJfaWQiOjE1LCJ1c2VybmFtZSI6InRlc3RBZG1pbiIsImVtYWlsIjoidGVzdEFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzYwMzQ3ODExLCJleHAiOjE3NjAzNTE0MTF9.3mGya0GsduRBnwQ8eT_9DqSpLOlOfRXuGsTEUBzz9gQ";
  const newCat = "Science";
  const res = await fetch("http://localhost:3000/api/getAllQuestions", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });
  const data: NewQuestion[] = await res.json() as NewQuestion[];
  for (const q of data) {
    console.log("Question:", q.question);
    console.log("Answer:", q.answer);
    console.log("Difficulty:", q.difficulty);
    console.log("Categories:", q.categories.join(", "));
    console.log("Options:", q.options.join(", "));
    console.log("---------------------------");
  }

  for (const q of data) {
    if (q.categories.includes(newCat)) {
      console.log(`Category "${newCat}" already exists for question: ${q.question}`);
      continue; // Skip to the next question
    } else {
      q.categories.push(newCat);
    }
  }
  for (const q of data) {
    console.log("Question:", q.question);
    console.log("Answer:", q.answer);
    console.log("Difficulty:", q.difficulty);
    console.log("Categories:", q.categories.join(", "));
    console.log("Options:", q.options.join(", "));
    console.log("---------------------------");
  }
}

test1().catch(err => console.error("Request failed:", err));
