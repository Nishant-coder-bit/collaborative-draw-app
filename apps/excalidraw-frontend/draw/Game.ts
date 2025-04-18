import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
    type: "rect";
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "line";
    startX: number;
    startY: number;
    endX: number;
    endY: number;
} | {
    type: "text";
    x: number;
    y: number;
    text: string;
}

export class Game {

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[]
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private text = "";
    private selectedTool: Tool = "circle";
    private backgroundColor:any = "white";
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId?: string, socket?: WebSocket,backgroundColor?:any) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.backgroundColor=backgroundColor
        //@ts-ignore
        this.roomId = roomId;
        //@ts-ignore
        this.socket = socket;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }
    
    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler)

        this.canvas.removeEventListener("mouseup", this.mouseUpHandler)

        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler)
    }

    setTool(tool: "circle" | "pencil" | "rect" | "line" | "text") {
        this.selectedTool = tool;
    }

    async init() {
        if(this.roomId)
        this.existingShapes = await getExistingShapes(this.roomId);
        console.log("shapes recieved",this.existingShapes);
        this.clearCanvas();
    }

    initHandlers() {
        if(this.socket){
            this.socket.onmessage = (event) => {
                const message = JSON.parse(event.data);
                console.log("message received", message);
                if (message.type == "chat") {
                    console.log("chat message received", message);
                    const parsedShape = JSON.parse(message.message)
                    this.existingShapes.push(parsedShape)
                    this.clearCanvas();
                }
            }
        }
        
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log("inside clear canvas");
        this.existingShapes.map((input) => {
            // console.log("RAW INPUT:", input); // Debugging log
        
            if (!input) {
                console.error("ERROR: input is undefined or null");
                return; // Skip this iteration
            }
        
            let parsedShape;
            try {
                parsedShape = typeof input === "string" ? JSON.parse(input) : input;
            } catch (error) {
                console.error("ERROR: Invalid JSON", error);
                return; // Skip this iteration
            }
        
            if (!parsedShape.shape) {
                console.error("ERROR: shape property is missing", parsedShape);
                return;
            }
        
            let eachShape = parsedShape.shape;
            // console.log("PARSED SHAPE:", eachShape);
        
            if (!eachShape.type) {
                console.error("ERROR: shape type is undefined", eachShape);
                return;
            }
        
            // Drawing logic
            if (eachShape.type === "rect") {
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.strokeRect(eachShape.x, eachShape.y, eachShape.width, eachShape.height);
            } else if (eachShape.type === "circle") {
                // console.log("inside circle", eachShape);
                this.ctx.beginPath();
                this.ctx.arc(eachShape.centerX, eachShape.centerY, Math.abs(eachShape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if(eachShape.type === "line"){
                this.ctx.strokeStyle = "rgba(255, 255, 255)";
                this.ctx.beginPath();
                this.ctx.moveTo(eachShape.startX, eachShape.startY);
                this.ctx.lineTo(eachShape.endX, eachShape.endY);
                this.ctx.stroke();
                this.ctx.closePath();                
            }else if(eachShape.type === "text"){
                this.ctx.font = "28px Georgia";
                this.ctx.fillStyle = "fuchsia";
                this.ctx.fillText(eachShape.text, eachShape.x, eachShape.y);
                 this.ctx.strokeStyle = "rgba(255, 255, 255)";
                 this.ctx.strokeText(eachShape.text, eachShape.x, eachShape.y);
            }
            });
        
        
    }

    mouseDownHandler = (e:any) => {
        this.clicked = true
        this.startX = e.clientX
        this.startY = e.clientY
        if(this.selectedTool === "text"){
            // give a starting line on screen to write text
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(this.startX + 1, this.startY);
            this.ctx.stroke();
            this.ctx.closePath();


        }

    }
    mouseUpHandler = (e:any) => {
        this.clicked = false
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        const selectedTool = this.selectedTool;
        let shape: Shape | null = null;
        if (selectedTool === "rect") {

            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width
            }
        } else if (selectedTool === "circle") {
            const radius = Math.max(width, height) / 2;
            shape = {
                type: "circle",
                radius: radius,
                centerX: this.startX + radius,
                centerY: this.startY + radius,
            }
        }else if(selectedTool === "line"){
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX,
                endY: e.clientY
            }
        }
        else if (selectedTool === "text") {
            shape = {
                type: "text",
                x: this.startX,
                y: this.startY,
                text: this.text
            }
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);
         console.log("sending shape", shape);
         console.log("sending shape", JSON.stringify(shape));
         let message:string = JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape
            }),
            roomId: this.roomId
        })
         console.log(message);
        // Ensure WebSocket is still open
    if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(message);
    } else {
        console.log("WebSocket is closed, unable to send message.");
    }
    }
    mouseMoveHandler = (e:any) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();
            this.ctx.strokeStyle = "rgba(255, 255, 255)"
            const selectedTool = this.selectedTool;
            console.log(selectedTool)
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);   
            } else if (selectedTool === "circle") {
                const radius = Math.max(width, height) / 2;
                const centerX = this.startX + radius;
                const centerY = this.startY + radius;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();                
            } else if(selectedTool === "line"){
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(e.clientX, e.clientY);
                this.ctx.stroke();
                this.ctx.closePath();                
            }
            else if (selectedTool === "text") {
                this.ctx.font = "28px Georgia";
                this.ctx.fillStyle = "fuchsia";
                this.ctx.fillText(this.text, this.startX, this.startY);
            }
        }
    }

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler)

        this.canvas.addEventListener("mouseup", this.mouseUpHandler)

        this.canvas.addEventListener("mousemove", this.mouseMoveHandler)    

    }
}