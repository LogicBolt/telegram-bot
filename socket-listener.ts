import { io } from "socket.io-client";

const socket = io("https://socket.daogram.0dns.co/");

socket.on("proposal", (proposal) => {
  console.log(proposal);
});
