"use client";

import { WS_URL } from "@/config";
import { useEffect, useRef, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjOWJkNmZhMi0zYmI4LTQ0MzAtYWU3Yy1mNzk3NDdiNTg4NWIiLCJpYXQiOjE3NDQ2NjM5MjF9.QMwRJcw1GKQMebHfJzgnVAsLk6mS1mUDarVSVrXNxT4`);
            ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log("Sending join_room:", data);
            ws.send(data);
        };
    
        ws.onclose = () => {
            console.warn("WebSocket closed");
            setSocket(null); // Reset the socket state
        };
    
        return () => {
            console.log("Closing WebSocket");
            ws.close(); // Cleanup when component unmounts
        };
    }, [roomId]);  // Depend on `roomId` to avoid unnecessary re-creation
    
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}