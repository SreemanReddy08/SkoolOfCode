import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from "react-markdown";

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [tutor, setTutor] = useState("Binary");
    const [typingMessage, setTypingMessage] = useState("");
    const messagesEndRef = useRef(null);

    const sendMessage = async () => {
        if (input.trim() === "") return;

        const userMessage = { from: "user", text: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput(""); // Clear input immediately

        try {
            const response = await axios.post("https://geminibackend-hwyu.onrender.com/generate", { prompt: input });
            const fullText = response.data.response;
            setTypingMessage("");

            let index = 0;
            const interval = setInterval(() => {
                if (index < fullText.length) {
                    setTypingMessage((prev) => prev + fullText[index]);
                    index++;
                    scrollToBottom();
                } else {
                    clearInterval(interval);
                    setMessages((prevMessages) => [...prevMessages, { from: "tutor", text: fullText }]);
                    setTypingMessage("");
                    scrollToBottom();
                }
            }, 30);

        } catch (error) {
            console.error("Error with API:", error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingMessage]);

    const renderMessage = (msg) => {
        if (msg.from === "user") {
            return <ReactMarkdown>{msg.text}</ReactMarkdown>;
        } else {
            return (
                <ReactMarkdown
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '')
                            return !inline && match ? (
                                <SyntaxHighlighter
                                    style={dracula}
                                    language={match[1]}
                                    PreTag="div"
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            )
                        }
                    }}
                >
                    {msg.text}
                </ReactMarkdown>
            );
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-800 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6">
            {/* Header */}
            <div className="bg-blue-950 text-white text-center py-4 px-8 text-2xl font-bold rounded-t-lg w-full max-w-5xl">
                I am Your Python Tutor {tutor}
                <div className="text-xs">By skoolofcode</div>
            </div>

            {/* Chat Box */}
            <div className="flex-grow overflow-hidden flex flex-col w-full max-w-5xl border  rounded-lg bg-black">
                <div className="flex-grow overflow-y-auto p-2 sm:p-4 md:p-6 space-y-4">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`inline-block max-w-full px-4 py-2 sm:px-6 sm:py-3 rounded-lg shadow-md ${
                                    msg.from === "user"
                                        ? "bg-blue-500 bg-opacity-30 text-white"
                                        : "bg-lime-700 bg-opacity-40 text-white"
                                }`}
                            >
                                {renderMessage(msg)}
                            </div>
                        </div>
                    ))}

                    {/* Live typing effect for AI messages */}
                    {typingMessage && (
                        <div className="flex justify-start">
                            <div className="inline-block max-w-full px-4 py-2 sm:px-6 sm:py-3 bg-gray-200 text-black rounded-lg shadow-md">
                                <ReactMarkdown>{typingMessage}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef}></div>
                </div>
            </div>

            {/* Input Bar (Fixed at Bottom) */}
            <div className="bg-black p-2 sm:p-4 shadow-lg flex items-center w-full max-w-5xl border-t border-gray-300 rounded-b-lg">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-grow p-2 sm:p-3 border bg-gray-900 text-white border-gray-300 rounded-l-lg outline-none"
                    placeholder="Type a message..."
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-r-lg hover:bg-blue-600"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default App;
