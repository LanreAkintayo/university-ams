import _ from "lodash";
import users, { type User } from "./users";

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
}

const fakers = {
  fakeMessages() {
    const messages: Array<Message> = [
      {
        id: "1",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Hello there!",
        timestamp: "2023-10-02T10:30:00Z",
      },
      {
        id: "2",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Hi, how are you?",
        timestamp: "2023-10-02T11:15:00Z",
      },
      {
        id: "3",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Good morning!",
        timestamp: "2023-10-02T11:45:00Z",
      },
      {
        id: "4",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "What's up?",
        timestamp: "2023-10-02T12:00:00Z",
      },
      {
        id: "5",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "I'm doing well, thanks!",
        timestamp: "2023-10-02T12:30:00Z",
      },
      {
        id: "6",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Any plans for the weekend?",
        timestamp: "2023-10-02T13:15:00Z",
      },
      {
        id: "7",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Not yet, but I'm thinking of going hiking.",
        timestamp: "2023-10-02T13:45:00Z",
      },
      {
        id: "8",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "That sounds fun!",
        timestamp: "2023-10-02T14:00:00Z",
      },
      {
        id: "9",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Hello, everyone!",
        timestamp: "2023-10-02T14:30:00Z",
      },
      {
        id: "10",
        sender: users.fakeUsers().map((user) => user)[0],
        content: "Hi James!",
        timestamp: "2023-10-02T15:00:00Z",
      },
    ];

    return _.shuffle(messages);
  },
};

export default fakers;
