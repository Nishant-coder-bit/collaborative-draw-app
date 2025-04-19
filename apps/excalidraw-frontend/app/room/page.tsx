"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RoomCanvas } from "@/components/RoomCanvas";
import { Canvas } from "@/components/Canvas";
import { SideBar } from "@/components/SideBar";

export default function RoomPage() {
  const { data, status }: any = useSession();
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [canvasBackground, setCanvasBackground] = useState("black");
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [roomError, setRoomError] = useState("");
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  const [joinError, setJoinError] = useState("");
  // Add useEffect for initial room validation
  useEffect(() => {
    const checkSavedRoom = async () => {
      if (status === "authenticated") {
        const savedRoomId = localStorage.getItem("roomId");
        if (savedRoomId) {
          try {
            const response = await fetch(
              `http://localhost:3001/room/${savedRoomId}`,
              {
                headers: {
                  authorization: data.accessToken,
                },
              }
            );

            if (response.status === 200) {
              console.log("inside checkSavedRoom ", savedRoomId);
              setRoomId(savedRoomId);
            } else {
              localStorage.removeItem("roomId");
            }
          } catch (error) {
            console.error("Room validation error:", error);
            localStorage.removeItem("roomId");
          }
        }
      }
    };

    checkSavedRoom();
  }, [status, data?.accessToken]);
  const handleBackgroundChange = (color: string) => {
    setCanvasBackground(color);
  };

  const handleCreateRoom = async () => {
    if (!data?.accessToken) return;

    setIsCreatingRoom(true);
    setRoomError("");

    try {
      const response = await fetch("http://localhost:3001/room", {
        method: "POST",
        headers: {
          authorization: `${data.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName }),
      });

      if (response.status === 200) {
        const { roomId: newRoomId } = await response.json();
        setRoomId(newRoomId);
        localStorage.setItem("roomId", newRoomId);
      } else {
        setRoomError("Failed to create room");
      }
    } catch (error) {
      setRoomError("Error creating room");
      console.error("Error creating room:", error);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomIdInput.trim()) return;

    setIsJoiningRoom(true);
    setJoinError("");

    try {
      const response = await fetch(
        `http://localhost:3001/room/${roomIdInput}`,
        {
          headers: {
            authorization: `${data?.accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setRoomId(roomIdInput);
        localStorage.setItem("roomId", roomIdInput);
      } else {
        setJoinError("Room not found");
      }
    } catch (error) {
      setJoinError("Error joining room");
      console.error("Error joining room:", error);
    } finally {
      setIsJoiningRoom(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      localStorage.removeItem("roomId");
      router.push("/signin");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <SideBar
        onCanvasBackgroundChange={handleBackgroundChange}
        onCreateRoom={handleCreateRoom}
        isCreatingRoom={isCreatingRoom}
        roomError={roomError}
        onJoinRoom={handleJoinRoom}
        roomIdInput={roomIdInput}
        setRoomIdInput={setRoomIdInput}
        setRoomName={setRoomName}
        roomName={roomName}
        isJoiningRoom={isJoiningRoom}
        joinError={joinError}
      />

      <div className="flex-1 relative">
        {roomId ? (
          <RoomCanvas
            key={roomId}
            roomId={roomId}
            backgroundColor={canvasBackground}
          />
        ) : (
          <Canvas key={canvasBackground} backgroundColor={canvasBackground} />
        )}
      </div>
    </div>
  );
}
