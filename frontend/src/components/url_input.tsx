import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SummaryCard, { Status } from "./summary";

const URLInput = () => {
  const [input, setInput] = useState("");
  const [url, setURL] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(Status.None);
  const [message, setMessage] = useState<string>("");

  const regexTest = (url: string) => {
    const regex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return regex.test(url);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
    setError("");
  };

  const checkURL = async () => {
    if (input !== url) {
      if (regexTest(input)) {
        setError("");
        setURL(input);

        setStatus(Status.Loading);

        try {
          const res = await fetch(
            `https://snackable.onrender.com/summarize?url=${input}`
          );
          if (!res.ok) {
            throw new Error("Server error");
          }

          const data = await res.json();         
          const result = data.result;
          
          if (result === "error") {
            setStatus(Status.Error);
            setMessage(data.message);
          } else {
            setStatus(Status.Fetched);
            setMessage(data.summary);
          }
        } catch (e) {
          setStatus(Status.Error);
          setMessage('Failed to connect to backend.');
        }
      } else {
        setError("Please enter a valid YouTube URL");
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      checkURL();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <p className="text-3xl text-center font-bold">What are we snacking?</p>
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Enter YouTube URL"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Button type="submit" onClick={checkURL}>
          Snack
        </Button>
      </div>
      {error && <p className="text-red-500 text-center text-sm">{error}</p>}
      <SummaryCard status={status} message={message} />
    </div>
  );
};

export default URLInput;
