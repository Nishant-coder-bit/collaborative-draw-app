"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { useSession } from "next-auth/react";

export function RoomCanvas({roomId,backgroundColor}: {roomId: string,backgroundColor?:any}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const session:any = useSession();
    console.log("inside roomCanva",session);
    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=${session.data?.accessToken}`);
                   ws.onopen = () => {
            setSocket(ws);
            console.log("inside room canvas",roomId);
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
        <Canvas key={roomId} roomId={roomId} socket={socket} backgroundColor={backgroundColor} />
    </div>
}