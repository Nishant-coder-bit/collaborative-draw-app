// pages/room.js
"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { RoomCanvas } from '@/components/RoomCanvas'; // Adjust the import path as needed
import { Canvas } from '@/components/Canvas';
import { SideBar } from '@/components/SideBar';

export default function RoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [canvasBackground, setCanvasBackground] = useState('#ffffff');

  const handleBackgroundChange = (color: string) => {
      setCanvasBackground(color);
      // Apply the color to your canvas implementation here
  };
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin'); // Redirect to sign-in if not authenticated
    } else if (status === 'authenticated' && !roomId) {
       // Give option to create room using backend http call 
      const newRoomId = ""
      setRoomId(newRoomId);
   
    }
  }, [status, router, roomId]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // Or a message indicating they need to sign in
  }

  return (
    <>
  
    <div style={{display:'flex',height:'100vh'}}>
       
    <SideBar onCanvasBackgroundChange={handleBackgroundChange}/>
       {roomId ? (
         <RoomCanvas roomId={roomId} />
       ) : (
         
         <Canvas key={canvasBackground} backgroundColor={canvasBackground}/>
         
       )}
     </div>
    </>
    
  );
}