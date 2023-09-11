import { useState } from "react";
import Title from "./Title";
import RecordMessage from "./RecordMessage";
import axios from "axios";

function Controller() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  const createBlobUrl = (data: any) => {
    const blob = new Blob([data], { type: "audio/mpeg" });
    const url = window.URL.createObjectURL(blob);
    return url;
  };

  const handleStop = async (blobUrl: string) => {
    setIsLoading(true);

    //apend recorded message to messages
    const myMessage = { sender: "me", blobUrl };
    const messagesArr = [...messages, myMessage];

    //convert blob url to blobobject

    fetch(blobUrl)
      .then((res) => res.blob())
      .then(async (blob) => {
        //construct audio to send file
        const formData = new FormData();
        formData.append("file", blob, "myFile.wav");

        //send form data to API endpoint
        await axios
          .post("http://localhost:8000/post-audio", formData, {
            headers: { "Content-Type": "audio/mpeg" },
            responseType: "arraybuffer",
          })
          .then((res: any) => {
            const blob = res.data;
            const audio = new Audio();
            audio.src = createBlobUrl(blob);

            //append response to audio
            const aiMessage = { sender: "Kasia", blobUrl: audio.src };
            messagesArr.push(aiMessage);
            setMessages(messagesArr);

            //play audio
            setIsLoading(false);
            audio.play();
          })
          .catch((err: any) => {
            console.log(err);
            setIsLoading(false);
          });
      });

    setIsLoading(false);
  };
  return (
    
      <div className="h-screen overflow-hidden">
        <Title setMessages={setMessages} />
        <div className="flex flex-col justify-between h-full overflow-scroll pb-96">
          {/* Messages */}
          <div className="mt-5 px-5">
            {messages.map((audio, index) => {
              return (
                <div
                  key={index + audio.sender}
                  className={
                    "flex flex-col " +
                    (audio.sender == "Kasia" ? "flex items-end" : "")
                  }
                >
                  {/* SENDER */}
                  <div className="mt-4">
                    <p
                      className={
                        audio.sender == "Kasia"
                          ? "text-right mr-2 italic text-green-500"
                          : "ml-2 italic text-blue-500"
                      }
                    >
                      {audio.sender}
                    </p>

                    {/* Audio Message */}
                    <audio
                      src={audio.blobUrl}
                      className="apperance-none"
                      controls
                    />
                  </div>
                </div>
              );
            })}
            {messages.length == 0 && !isLoading && (
              <div className="text-center text-black font-light italic mt-10">
                Wyślij Kasi wiadomość...
              </div>
            )}
            { isLoading && (
              <div className="text-center text-black font-light italic mt-10 animate-pulse">
                czekaj ...
              </div>
            )}
          </div>

          {/* Recorder */}
          <div className="fixed bottom-0 w-full py-6 border-t text-center bg-gradient-to-r from-slate-500 to-green-950">
            <div className="flex justify-center items-center w-full">
              <RecordMessage handleStop={handleStop} />
            </div>
          </div>
        </div>
      </div>
    
  );
}

export default Controller;
