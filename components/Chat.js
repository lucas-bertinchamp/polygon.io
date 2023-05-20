import React, { useState } from "react";
import style from "@/styles/Chat.module.css";
import { useEffect } from "react";

const Chat = ({ playerName }) => {
    // Miaou

    const [messages, setMessages] = useState([]);

    useEffect(() => {
        // Masquer chaque message du chat après 10 secondes
        messages.forEach((message, index) => {
            const timeout = setTimeout(() => {
                setMessages((prevMessages) => {
                    const updatedMessages = [...prevMessages];
                    updatedMessages.splice(index, 1); // Supprimer le message à l'index spécifié
                    return updatedMessages;
                });
            }, 10000);

            // Nettoyer le timeout lorsque le composant est démonté ou lorsque le message est supprimé manuellement
            return () => clearTimeout(timeout);
        });
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const message = e.target.message.value;
        const fullMessage = `${playerName}: ${message}`;
        setMessages((prevMessages) => [...prevMessages, fullMessage]);
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
                <input type="text" name="message" />
            </form>
        </div>
    );
};

export default Chat;
