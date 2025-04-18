import { Game } from "@/draw/Game";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, LineChartIcon, Pencil, RectangleHorizontalIcon, Text } from "lucide-react";

export type Tool = "circle" | "rect" | "pencil" | "line" | "text";

export function Canvas({
    roomId,
    socket,
    backgroundColor
}: {
    socket?: WebSocket | null;
    roomId?: string;
    backgroundColor?:any
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        if (game) {
            game.setTool(selectedTool);
        }
    }, [selectedTool, game]);
    useEffect(()=>{
        
        canvasRef.current!.style.backgroundColor = backgroundColor;
        
    },[backgroundColor])
    useEffect(() => {
        if (canvasRef.current) {
            let newGame: Game;
            if (socket && roomId) {
                //@ts-ignore
                newGame = new Game(canvasRef.current, roomId, socket,backgroundColor);
            } else {
                // Create a Game instance without socket and roomId initially
                newGame = new Game(canvasRef.current, undefined, undefined,backgroundColor);
                console.warn("Game initialized without WebSocket connection or Room ID.");
            }
            setGame(newGame);
            return () => {
                newGame.destroy();
            };
        }
    }, [canvasRef, socket, roomId,backgroundColor]);

    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
            <canvas  ref={canvasRef} width={window.innerWidth} height={window.innerHeight} ></canvas>
            <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} />
        </div>
    );
}

function Topbar({ selectedTool, setSelectedTool }: {
    selectedTool: Tool;
    setSelectedTool: (tool: Tool) => void;
}) {
    return (
        <div style={{
            position: "fixed",
            top: 10,
            left: 500,
            display:"flex",
            justifyContent:"center",
            alignItems:"center"
        }}>
            <div className="flex gap-t">
                <IconButton
                    onClick={() => {
                        setSelectedTool("pencil");
                    }}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton onClick={() => {
                    setSelectedTool("rect");
                }} activated={selectedTool === "rect"} icon={<RectangleHorizontalIcon />} ></IconButton>
                <IconButton onClick={() => {
                    setSelectedTool("circle");
                }} activated={selectedTool === "circle"} icon={<Circle />}></IconButton>

                <IconButton onClick={() => {
                    setSelectedTool("line");
                }} activated={selectedTool === "line"} icon={<LineChartIcon />}></IconButton>

                <IconButton onClick={() => {
                    setSelectedTool("text");
                }} activated={selectedTool === "text"} icon={<Text />}></IconButton>
            </div>
        </div>
    );
}