import React, { useState } from "react";
import style from "@/styles/Chat.module.css";
import { useEffect } from "react";

const Chat = ({ socket }) => {
  // Miaou

  const [messages, setMessages] = useState([]);

  // Ecouter les messages du serveur
  socket.on("messageList", (message) => {
    let messages = message.map((message) => {
      return JSON.parse(message).message;
    });
    setMessages((prevMessages) => [...messages].reverse());
  });

  /*Appelée suite à la submission d'un message, cette fonction permet d'en identifier les propriétés pour les envoyer au serveur*/
  const handleSubmit = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    const time = Date.now();

    // Envoyer le message au serveur
    socket.emit("message", { message: message, time: time });

    e.target.message.value = "";
  };

  return (
    <div className={style.chat}>
      <div>
        {messages.map((message, index) => (
          <div key={index}>{message}</div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" name="message" id="chat" />
      </form>
    </div>
  );
};

export default Chat;
